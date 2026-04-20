"""
Multi-Objective VRP Optimizer — Flask API
Run:  python optimizer_api.py
Deps: pip install flask flask-cors pulp numpy pymongo python-dotenv requests
"""

import os
import logging

from flask import Flask, request, jsonify
from flask_cors import CORS
import pulp
import numpy as np
import math, time, warnings
import requests
from dataclasses import dataclass
from datetime import datetime, timezone
from dotenv import load_dotenv

from db import areas_col, vehicles_col, depot_col, config_col, runs_col

load_dotenv()

warnings.filterwarnings("ignore")

app = Flask(__name__)
CORS(app)


# ── DATA STRUCTURES ────────────────────────────────────────────────────────────

@dataclass
class Location:
    id: int
    name: str
    lat: float
    lon: float
    demand: float = 0.0
    service_time: float = 0.0
    time_window_start: float = 0.0
    time_window_end: float = 1440.0
    priority: int = 1


@dataclass
class Vehicle:
    id: int
    name: str
    vehicle_type: str
    capacity: float
    cost_per_km: float
    co2_per_km: float
    max_range: float
    max_shift_hours: float = 8.0
    speed_kmh: float = 40.0


@dataclass
class OptimizationConfig:
    w_cost: float = 0.5
    w_co2: float = 0.3
    w_fairness: float = 0.2
    time_limit_seconds: int | None = None  # None = no limit, run to optimal
    solver_gap: float = 0.0               # 0 = find true optimal, no early exit
    cost_reduction_target: float = 0.15
    co2_reduction_target: float = 0.10


# ── MONGO LOADERS ──────────────────────────────────────────────────────────────

def load_areas():
    """Returns list of area dicts from MongoDB."""
    return list(areas_col().find({}, {"_id": 0}))


def load_vehicle_specs():
    """Returns list of active vehicle spec dicts from MongoDB."""
    return list(vehicles_col().find({"active": True}, {"_id": 0}))


def load_depot():
    """Returns the depot document from MongoDB."""
    doc = depot_col().find_one({}, {"_id": 0})
    if doc is None:
        raise RuntimeError("No depot found in MongoDB. Run seed_db.py first.")
    return doc


def load_default_config() -> OptimizationConfig:
    """Returns solver defaults from MongoDB (falls back to hardcoded if missing)."""
    doc = config_col().find_one({}, {"_id": 0}) or {}
    return OptimizationConfig(
        w_cost=doc.get("w_cost", 0.5),
        w_co2=doc.get("w_co2", 0.3),
        w_fairness=doc.get("w_fairness", 0.2),
        time_limit_seconds=doc.get("time_limit_seconds", 60),
        solver_gap=doc.get("solver_gap", 0.25),
        cost_reduction_target=doc.get("cost_reduction_target", 0.15),
        co2_reduction_target=doc.get("co2_reduction_target", 0.10),
    )


def save_run(payload: dict):
    """Saves a completed optimization run to MongoDB."""
    payload["timestamp"] = datetime.now(timezone.utc)
    runs_col().insert_one(payload)


# ── UTILITIES ──────────────────────────────────────────────────────────────────

def haversine_km(lat1, lon1, lat2, lon2):
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlam/2)**2
    return 2 * R * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def build_distance_matrix(locations):
    n = len(locations)
    dist = np.zeros((n, n))
    for i in range(n):
        for j in range(n):
            if i != j:
                dist[i][j] = haversine_km(
                    locations[i].lat, locations[i].lon,
                    locations[j].lat, locations[j].lon)
    return dist


def build_time_matrix(dist_matrix, speed_kmh=40.0):
    return (dist_matrix / speed_kmh) * 60.0


def to_json_safe(obj):
    """Recursively convert numpy types to Python natives for jsonify."""
    if isinstance(obj, dict):
        return {k: to_json_safe(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [to_json_safe(i) for i in obj]
    if isinstance(obj, np.integer):
        return int(obj)
    if isinstance(obj, np.floating):
        return float(obj)
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    return obj


# ── DATA GENERATOR ─────────────────────────────────────────────────────────────

def generate_data(n_customers=15, n_vehicles=5, seed=42):
    """Builds Location and Vehicle lists using data from MongoDB."""
    rng = np.random.RandomState(seed)

    depot_doc = load_depot()
    depot = Location(
        id=0,
        name=depot_doc["name"],
        lat=depot_doc["lat"],
        lon=depot_doc["lon"],
        time_window_start=depot_doc.get("time_window_start", 300),
        time_window_end=depot_doc.get("time_window_end", 1380),
    )

    areas = load_areas()
    locations = [depot]
    for i in range(n_customers):
        area = areas[i % len(areas)]
        locations.append(Location(
            id=i + 1,
            name=f"Customer {i+1} ({area['name']})",
            lat=float(area["lat"] + rng.normal(0, 0.003)),
            lon=float(area["lon"] + rng.normal(0, 0.003)),
            demand=round(float(rng.uniform(10, 120)), 1),
            service_time=round(float(rng.uniform(5, 12)), 1),
            time_window_start=float(rng.choice([360, 420, 480])),
            time_window_end=float(rng.choice([1140, 1200, 1260, 1320])),
            priority=int(rng.choice([1, 2, 3], p=[0.6, 0.25, 0.15]))
        ))

    specs = load_vehicle_specs()
    vehicles = []
    for i in range(n_vehicles):
        spec = specs[i % len(specs)]
        vehicles.append(Vehicle(
            id=i,
            name=spec["name"],
            vehicle_type=spec["vehicle_type"],
            capacity=spec["capacity"],
            cost_per_km=spec["cost_per_km"],
            co2_per_km=spec["co2_per_km"],
            max_range=spec["max_range"],
            max_shift_hours=spec.get("max_shift_hours", 8.0),
            speed_kmh=round(float(rng.uniform(35, 50)), 1),
        ))

    return locations, vehicles


# ── BASELINE: NEAREST NEIGHBOUR ────────────────────────────────────────────────

def solve_baseline(locations, vehicles, dist_matrix):
    n = len(locations)
    unvisited = set(range(1, n))
    routes, vehicle_loads = {}, {}
    total_cost = total_co2 = 0.0

    for v in vehicles:
        if not unvisited:
            break
        route, load, distance, current = [0], 0.0, 0.0, 0

        while unvisited:
            best, best_d = None, float('inf')
            for c in unvisited:
                d = dist_matrix[current][c]
                if (d < best_d and
                        load + locations[c].demand <= v.capacity and
                        distance + d + dist_matrix[c][0] <= v.max_range):
                    best, best_d = c, d
            if best is None:
                break
            route.append(best)
            unvisited.remove(best)
            load += locations[best].demand
            distance += best_d
            current = best

        if len(route) > 1:
            distance += dist_matrix[current][0]
            route.append(0)
            cost = distance * v.cost_per_km
            co2 = distance * v.co2_per_km
            total_cost += cost
            total_co2 += co2
            vehicle_loads[v.id] = float(distance)
            routes[str(v.id)] = {
                "vehicle": v.name,
                "vehicle_type": v.vehicle_type,
                "route": route,
                "distance_km": round(float(distance), 2),
                "cost_sar": round(float(cost), 2),
                "co2_kg": round(float(co2), 2),
                "load_kg": round(float(load), 1),
            }

    mx = max(vehicle_loads.values(), default=1.0)
    mn = min(vehicle_loads.values(), default=0.0)
    return {
        "routes": routes,
        "total_cost_sar": round(float(total_cost), 2),
        "total_co2_kg": round(float(total_co2), 2),
        "total_distance_km": round(float(sum(vehicle_loads.values())), 2),
        "vehicles_used": len(routes),
        "workload_balance": round(1 - (mx - mn) / mx, 3) if mx > 0 else 0.0,
    }


# ── MILP OPTIMIZER ─────────────────────────────────────────────────────────────

class FleetOptimizer:
    def __init__(self, locations, vehicles, config=None):
        self.locations = locations
        self.vehicles = vehicles
        self.config = config or OptimizationConfig()
        self.n = len(locations)
        self.m = len(vehicles)
        self.customers = list(range(1, self.n))
        self.dist = build_distance_matrix(locations)
        self.time_matrix = {v.id: build_time_matrix(self.dist, v.speed_kmh) for v in vehicles}

    def _big_m(self):
        max_tw = max(loc.time_window_end for loc in self.locations)
        max_travel = max(float(np.max(tm)) for tm in self.time_matrix.values())
        max_svc = max(loc.service_time for loc in self.locations)
        return max_tw + max_travel + max_svc + 10

    def solve(self, weights=None, time_limit=None):
        w1, w2, w3 = weights or (self.config.w_cost, self.config.w_co2, self.config.w_fairness)
        tl = time_limit or self.config.time_limit_seconds
        n, m = self.n, self.m
        M = self._big_m()
        max_range = max(v.max_range for v in self.vehicles)

        t0 = time.time()
        prob = pulp.LpProblem("MO_VRP", pulp.LpMinimize)

        x = {(i, j, k): pulp.LpVariable(f"x_{i}_{j}_{k}", cat="Binary")
             for k in range(m) for i in range(n) for j in range(n) if i != j}
        y = {k: pulp.LpVariable(f"y_{k}", cat="Binary") for k in range(m)}
        u = {(i, k): pulp.LpVariable(f"u_{i}_{k}", 1, n - 1)
             for k in range(m) for i in self.customers}
        s = {(i, k): pulp.LpVariable(
                f"s_{i}_{k}",
                self.locations[i].time_window_start if i > 0 else 0,
                self.locations[i].time_window_end)
             for k in range(m) for i in range(n)}
        L = {k: pulp.LpVariable(f"L_{k}", 0, max_range) for k in range(m)}
        L_max = pulp.LpVariable("L_max", 0, max_range)
        L_min = pulp.LpVariable("L_min", 0, max_range)

        cost_expr = pulp.lpSum(
            self.vehicles[k].cost_per_km * self.dist[i][j] * x[i, j, k]
            for k in range(m) for i in range(n) for j in range(n) if i != j)
        co2_expr = pulp.lpSum(
            self.vehicles[k].co2_per_km * self.dist[i][j] * x[i, j, k]
            for k in range(m) for i in range(n) for j in range(n) if i != j)
        prob += w1 * cost_expr + w2 * co2_expr + w3 * (L_max - L_min)

        for j in self.customers:
            prob += pulp.lpSum(x[i, j, k] for k in range(m) for i in range(n) if i != j) == 1

        for k in range(m):
            for h in range(n):
                prob += (pulp.lpSum(x[i, h, k] for i in range(n) if i != h) ==
                         pulp.lpSum(x[h, j, k] for j in range(n) if j != h))
            prob += pulp.lpSum(x[0, j, k] for j in self.customers) <= 1
            prob += pulp.lpSum(x[j, 0, k] for j in self.customers) <= 1
            prob += pulp.lpSum(x[0, j, k] for j in self.customers) == y[k]
            prob += pulp.lpSum(
                self.locations[j].demand * pulp.lpSum(x[i, j, k] for i in range(n) if i != j)
                for j in self.customers) <= self.vehicles[k].capacity
            prob += pulp.lpSum(
                self.dist[i][j] * x[i, j, k]
                for i in range(n) for j in range(n) if i != j) <= self.vehicles[k].max_range
            for i in self.customers:
                for j in self.customers:
                    if i != j:
                        prob += u[i, k] - u[j, k] + (n - 1) * x[i, j, k] <= n - 2
            vid = self.vehicles[k].id
            for i in range(n):
                for j in self.customers:
                    if i != j:
                        prob += (s[j, k] >= s[i, k] + self.locations[i].service_time
                                 + self.time_matrix[vid][i][j] - M * (1 - x[i, j, k]))
            shift = self.vehicles[k].max_shift_hours * 60
            prob += pulp.lpSum(
                (self.time_matrix[vid][i][j] + self.locations[i].service_time) * x[i, j, k]
                for i in range(n) for j in range(n) if i != j) <= shift
            prob += L[k] == pulp.lpSum(
                self.dist[i][j] * x[i, j, k]
                for i in range(n) for j in range(n) if i != j)
            prob += L_max >= L[k]
            prob += L_min <= L[k] + M * (1 - y[k])

        solver_kwargs = {"gapRel": self.config.solver_gap, "msg": 0}
        if tl is not None:
            solver_kwargs["timeLimit"] = tl
        solver = pulp.PULP_CBC_CMD(**solver_kwargs)
        prob.solve(solver)
        elapsed = time.time() - t0
        status = pulp.LpStatus[prob.status]

        if status not in ("Optimal", "Feasible"):
            return {"status": status, "error": f"Solver: {status}", "solve_time_s": round(elapsed, 2)}

        return self._extract(prob, x, y, s, status, elapsed)

    def _extract(self, prob, x, y, s, status, elapsed):
        n, m = self.n, self.m
        routes = {}
        for k in range(m):
            if (pulp.value(y[k]) or 0) < 0.5:
                continue
            route, current, visited = [0], 0, set()
            for _ in range(n + 1):
                nxt = next(
                    (j for j in range(n)
                     if j != current and (current, j, k) in x
                     and (pulp.value(x[current, j, k]) or 0) > 0.5),
                    None)
                if nxt is None or nxt == 0:
                    route.append(0)
                    break
                if nxt in visited:
                    route.append(0)
                    break
                visited.add(nxt)
                route.append(nxt)
                current = nxt
            if route == [0, 0]:
                continue
            dist_r = sum(float(self.dist[route[i]][route[i+1]]) for i in range(len(route)-1))
            load_r = sum(self.locations[c].demand for c in route if c != 0)
            routes[str(k)] = {
                "vehicle": self.vehicles[k].name,
                "vehicle_type": self.vehicles[k].vehicle_type,
                "route": [int(r) for r in route],
                "route_names": [self.locations[r].name for r in route],
                "distance_km": round(dist_r, 2),
                "cost_sar": round(dist_r * self.vehicles[k].cost_per_km, 2),
                "co2_kg": round(dist_r * self.vehicles[k].co2_per_km, 2),
                "load_kg": round(float(load_r), 1),
                "capacity_util": round(float(load_r) / self.vehicles[k].capacity * 100, 1),
            }
        tc = sum(r["cost_sar"] for r in routes.values())
        tco2 = sum(r["co2_kg"] for r in routes.values())
        td = sum(r["distance_km"] for r in routes.values())
        dists = [r["distance_km"] for r in routes.values()]
        mx, mn = (max(dists), min(dists)) if dists else (1, 0)
        wb = round(1 - (mx - mn) / mx, 3) if mx > 0 else 1.0
        return {
            "routes": routes,
            "total_cost_sar": round(tc, 2),
            "total_co2_kg": round(tco2, 2),
            "total_distance_km": round(td, 2),
            "vehicles_used": len(routes),
            "fleet_utilization": round(len(routes) / self.m, 3),
            "workload_balance": wb,
            "status": status,
            "solve_time_s": round(elapsed, 2),
        }

    def compare(self, baseline, optimized):
        bc, oc = baseline["total_cost_sar"], optimized["total_cost_sar"]
        be, oe = baseline["total_co2_kg"], optimized["total_co2_kg"]
        cost_red = (bc - oc) / bc if bc > 0 else 0
        co2_red = (be - oe) / be if be > 0 else 0
        return {
            "cost_reduction_pct": round(cost_red * 100, 2),
            "co2_reduction_pct": round(co2_red * 100, 2),
            "vehicles_baseline": baseline["vehicles_used"],
            "vehicles_optimized": optimized["vehicles_used"],
            "workload_baseline": baseline["workload_balance"],
            "workload_optimized": optimized["workload_balance"],
            "spec1_met": cost_red >= self.config.cost_reduction_target,
            "spec3_met": co2_red >= self.config.co2_reduction_target,
            "spec2_met": optimized["vehicles_used"] > baseline["vehicles_used"],
        }


# ── FLASK ENDPOINTS ────────────────────────────────────────────────────────────

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'solver': 'PuLP/CBC'})


@app.route('/optimize', methods=['POST'])
def optimize():
    body = request.json or {}
    n_customers = max(5,  min(int(body.get('n_customers', 10)), 15))
    n_vehicles  = max(2,  min(int(body.get('n_vehicles',   5)),  8))
    w_cost      = float(body.get('w_cost',    0.5))
    w_co2       = float(body.get('w_co2',     0.3))
    w_fairness  = float(body.get('w_fairness', 0.2))
    raw_tl      = body.get('time_limit')
    time_limit  = int(raw_tl) if raw_tl is not None else None  # None = no limit
    seed        = int(body.get('seed', 42))

    locations, vehicles = generate_data(n_customers, n_vehicles, seed=seed)
    dist_matrix = build_distance_matrix(locations)
    baseline = solve_baseline(locations, vehicles, dist_matrix)

    default_cfg = load_default_config()
    config = OptimizationConfig(
        w_cost=w_cost, w_co2=w_co2, w_fairness=w_fairness,
        time_limit_seconds=time_limit,
        solver_gap=default_cfg.solver_gap,
        cost_reduction_target=default_cfg.cost_reduction_target,
        co2_reduction_target=default_cfg.co2_reduction_target,
    )
    optimizer = FleetOptimizer(locations, vehicles, config)
    result = optimizer.solve()

    if result.get('status') not in ('Optimal', 'Feasible'):
        return jsonify({'status': 'error', 'message': result.get('error', 'Solver failed')}), 500

    comparison = optimizer.compare(baseline, result)

    response = to_json_safe({
        'status':      'success',
        'n_customers': n_customers,
        'n_vehicles':  n_vehicles,
        'baseline':    baseline,
        'optimized':   result,
        'comparison':  comparison,
    })

    # Persist this run to MongoDB (fire-and-forget — don't block the response)
    try:
        save_run({
            "n_customers": n_customers,
            "n_vehicles":  n_vehicles,
            "weights":     {"cost": w_cost, "co2": w_co2, "fairness": w_fairness},
            "seed":        seed,
            "baseline":    baseline,
            "optimized":   result,
            "comparison":  comparison,
        })
    except Exception:
        pass  # never fail the API response because of a DB write error

    return jsonify(response)


@app.route('/fleet-routes', methods=['GET'])
def fleet_routes():
    """
    Returns all DB vehicles with enriched route data for the Live Fleet map.
    Always uses all 7 vehicles from MongoDB with 15 customers (seed=42) so
    every vehicle gets a route. Uses the latest optimized run if one exists.
    Stop statuses: first stop = completed, second = current, rest = upcoming,
    last = final.
    """
    specs = load_vehicle_specs()
    n_veh = len(specs)   # all vehicles in the DB (7)
    n_cust = 15
    seed = 42
    source = 'baseline'

    # Use latest optimized run if available (prefer its customer count/seed)
    run = runs_col().find_one({}, sort=[("timestamp", -1)])
    if run:
        n_cust = max(n_cust, run.get('n_customers', 15))
        seed = run.get('seed', 42)
        source = 'optimized'

    locations, vehicles_list = generate_data(n_cust, n_veh, seed=seed)
    dist_matrix = build_distance_matrix(locations)

    if run and source == 'optimized':
        raw_routes = run['optimized']['routes']
    else:
        baseline = solve_baseline(locations, vehicles_list, dist_matrix)
        raw_routes = baseline['routes']

    depot = locations[0]

    def assign_statuses(loc_ids):
        stops = [loc_id for loc_id in loc_ids if loc_id != 0]
        n = len(stops)
        result = []
        for i, loc_id in enumerate(stops):
            loc = locations[loc_id]
            if n == 1:
                status = 'final'
            elif i == 0:
                status = 'completed'
            elif i == 1 and n > 2:
                status = 'current'
            elif i == n - 1:
                status = 'final'
            else:
                status = 'upcoming'
            result.append({
                'id': loc.id, 'name': loc.name,
                'lat': loc.lat, 'lon': loc.lon,
                'status': status,
            })
        return result

    # Build output for vehicles that received a route
    vehicles_out = []
    routed_names = set()
    for k, r in raw_routes.items():
        stops = assign_statuses(r['route'])
        vehicles_out.append({
            'id':           f"V{int(k)+1:03d}",
            'name':         r['vehicle'],
            'vehicle_type': r['vehicle_type'],
            'stops':        stops,
            'distance_km':  r.get('distance_km', 0),
            'cost_sar':     r.get('cost_sar', 0),
            'co2_kg':       r.get('co2_kg', 0),
            'load_kg':      r.get('load_kg', 0),
            'idle':         False,
        })
        routed_names.add(r['vehicle'])

    # Add idle vehicles (in DB but not assigned a route this run)
    for spec in specs:
        if spec['name'] not in routed_names:
            vehicles_out.append({
                'id':           f"IDLE_{spec['name'].replace(' ', '_')}",
                'name':         spec['name'],
                'vehicle_type': spec['vehicle_type'],
                'stops':        [],
                'distance_km':  0,
                'cost_sar':     0,
                'co2_kg':       0,
                'load_kg':      0,
                'idle':         True,
            })

    return jsonify(to_json_safe({
        'depot':    {'name': depot.name, 'lat': depot.lat, 'lon': depot.lon},
        'vehicles': vehicles_out,
        'source':   source,
    }))


@app.route('/runs', methods=['GET'])
def list_runs():
    """Returns the 20 most recent optimization runs from MongoDB."""
    docs = list(
        runs_col()
        .find({}, {"_id": 0})
        .sort("timestamp", -1)
        .limit(20)
    )
    for d in docs:
        if "timestamp" in d:
            d["timestamp"] = d["timestamp"].isoformat()
    return jsonify(docs)


# ── HERE GEOCODING PROXY ──────────────────────────────────────────────────────
# Server-side proxy to the HERE Geocoding API. Keeps HERE_API_KEY off the client.
# Accepts full KSA addresses or Saudi short addresses (e.g. "RCTB4359").

HERE_GEOCODE_URL = "https://geocode.search.hereapi.com/v1/geocode"
_geocode_log = logging.getLogger("geocode")


def _here_request(query: str, api_key: str, timeout: float = 5.0):
    return requests.get(
        HERE_GEOCODE_URL,
        params={"q": query, "apiKey": api_key, "in": "countryCode:SAU"},
        timeout=timeout,
    )


@app.route('/geocode', methods=['GET'])
@app.route('/api/geocode', methods=['GET'])
def geocode():
    query = (request.args.get('q') or '').strip()
    if not query:
        return jsonify({'error': 'empty_query'}), 400

    api_key = os.environ.get('HERE_API_KEY', '').strip()
    if not api_key:
        return jsonify({'error': 'missing_api_key'}), 500

    # One retry on transient failure (timeout / 5xx / connection error).
    last_err = None
    for attempt in range(2):
        try:
            res = _here_request(query, api_key)
            if res.status_code >= 500:
                last_err = f'here_status_{res.status_code}'
                continue
            if res.status_code != 200:
                _geocode_log.warning("HERE returned %s for query=%r", res.status_code, query)
                return jsonify({'error': f'here_status_{res.status_code}'}), 502
            data = res.json()
            items = data.get('items') or []
            if not items:
                return jsonify({'error': 'address_not_found'}), 404

            it = items[0]
            pos = it.get('position') or {}
            addr = it.get('address') or {}
            return jsonify({
                'title':            it.get('title'),
                'formatted_address': addr.get('label'),
                'latitude':         pos.get('lat'),
                'longitude':        pos.get('lng'),
                'country_code':     addr.get('countryCode'),
                'city':             addr.get('city'),
                'district':         addr.get('district'),
                'street':           addr.get('street'),
                'house_number':     addr.get('houseNumber'),
                'postal_code':      addr.get('postalCode'),
                'result_type':      it.get('resultType'),
                'query_score':      (it.get('scoring') or {}).get('queryScore'),
                'raw_response':     it,
            })
        except (requests.Timeout, requests.ConnectionError) as e:
            last_err = type(e).__name__
            continue

    _geocode_log.warning("HERE geocoding failed for query=%r: %s", query, last_err)
    return jsonify({'error': 'upstream_unavailable', 'detail': last_err}), 504


if __name__ == '__main__':
    print("VRP Optimizer API — http://localhost:5001")
    print("Install:  pip install flask flask-cors pulp numpy pymongo python-dotenv requests")
    app.run(host='0.0.0.0', port=5001, debug=False)
