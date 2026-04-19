"""
Multi-Objective VRP Optimizer — Flask API
Run:  python optimizer_api.py
Deps: pip install flask flask-cors pulp numpy
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pulp
import numpy as np
import math, time, warnings
from dataclasses import dataclass

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
    time_limit_seconds: int = 60
    solver_gap: float = 0.25
    cost_reduction_target: float = 0.15
    co2_reduction_target: float = 0.10


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

RIYADH_AREAS = [
    ("Al Olaya",            24.6900, 46.6850),
    ("Al Malaz",            24.6650, 46.7200),
    ("Al Murabba",          24.6500, 46.7100),
    ("Sulaimaniyah",        24.6950, 46.6600),
    ("Al Wurud",            24.6800, 46.6900),
    ("Al Rawdah",           24.7300, 46.7200),
    ("Al Nakheel",          24.7650, 46.6350),
    ("Al Sahafah",          24.7900, 46.6500),
    ("Al Yasmin",           24.8100, 46.6200),
    ("Al Narjis",           24.8300, 46.6100),
    ("Al Suwaidi",          24.6100, 46.6400),
    ("Al Shifa",            24.5800, 46.7000),
    ("Al Aziziyah",         24.6300, 46.7800),
    ("King Fahd District",  24.7100, 46.7500),
    ("Al Hamra",            24.7400, 46.6100),
    ("Al Rabwah",           24.6700, 46.7400),
    ("Hittin",              24.7700, 46.6000),
    ("Al Mursalat",         24.7200, 46.6400),
    ("Tuwaiq",              24.6250, 46.5900),
    ("Al Khaleej",          24.7050, 46.7600),
]

VEHICLE_SPECS = [
    ("Truck-ICE-1", "ICE",    500, 1.80, 0.27, 400),
    ("Truck-ICE-2", "ICE",    500, 1.80, 0.27, 400),
    ("Van-ICE-1",   "ICE",    500, 1.20, 0.18, 350),
    ("Van-EV-1",    "EV",     200, 0.60, 0.02, 150),
    ("Van-EV-2",    "EV",     200, 0.60, 0.02, 150),
    ("Van-Hybrid-1","Hybrid", 300, 0.90, 0.09, 250),
    ("Pickup-ICE-1","ICE",    500, 1.00, 0.15, 300),
]


def generate_dummy_data(n_customers=15, n_vehicles=5, seed=42):
    rng = np.random.RandomState(seed)
    depot = Location(id=0, name="Depot (Riyadh Warehouse)",
                     lat=24.7136, lon=46.6753,
                     time_window_start=300, time_window_end=1380)
    locations = [depot]
    for i in range(n_customers):
        area = RIYADH_AREAS[i % len(RIYADH_AREAS)]
        locations.append(Location(
            id=i + 1,
            name=f"Customer {i+1} ({area[0]})",
            lat=float(area[1] + rng.normal(0, 0.003)),
            lon=float(area[2] + rng.normal(0, 0.003)),
            demand=round(float(rng.uniform(10, 120)), 1),
            service_time=round(float(rng.uniform(5, 12)), 1),
            time_window_start=float(rng.choice([360, 420, 480])),
            time_window_end=float(rng.choice([1140, 1200, 1260, 1320])),
            priority=int(rng.choice([1, 2, 3], p=[0.6, 0.25, 0.15]))
        ))
    vehicles = []
    for i in range(n_vehicles):
        spec = VEHICLE_SPECS[i % len(VEHICLE_SPECS)]
        vehicles.append(Vehicle(
            id=i, name=spec[0], vehicle_type=spec[1],
            capacity=spec[2], cost_per_km=spec[3],
            co2_per_km=spec[4], max_range=spec[5],
            speed_kmh=round(float(rng.uniform(35, 50)), 1)
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

        solver = pulp.PULP_CBC_CMD(timeLimit=tl, gapRel=self.config.solver_gap, msg=0)
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
    time_limit  = max(30, min(int(body.get('time_limit', 60)), 120))
    seed        = int(body.get('seed', 42))

    locations, vehicles = generate_dummy_data(n_customers, n_vehicles, seed=seed)
    dist_matrix = build_distance_matrix(locations)
    baseline = solve_baseline(locations, vehicles, dist_matrix)

    config = OptimizationConfig(w_cost=w_cost, w_co2=w_co2, w_fairness=w_fairness,
                                 time_limit_seconds=time_limit)
    optimizer = FleetOptimizer(locations, vehicles, config)
    result = optimizer.solve()

    if result.get('status') not in ('Optimal', 'Feasible'):
        return jsonify({'status': 'error', 'message': result.get('error', 'Solver failed')}), 500

    comparison = optimizer.compare(baseline, result)
    return jsonify(to_json_safe({
        'status': 'success',
        'n_customers': n_customers,
        'n_vehicles': n_vehicles,
        'baseline': baseline,
        'optimized': result,
        'comparison': comparison,
    }))


if __name__ == '__main__':
    print("VRP Optimizer API — http://localhost:5001")
    print("Install:  pip install flask flask-cors pulp numpy")
    app.run(host='0.0.0.0', port=5001, debug=False)
