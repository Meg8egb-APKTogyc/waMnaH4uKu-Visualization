#include <iostream>
#include <vector>
#include <cmath>
#include <algorithm>
#include <random>
#include <chrono>
#include <fstream>

using namespace std;

double calcDist(const pair<int, int>& right, const pair<int, int>& left) {
    int x = right.first - left.first;
    int y = right.second - left.second;
    return sqrt(x * x + y * y);
}

vector<vector<double>> createMatrix(const vector<pair<int, int>>& cities) {
    int n = cities.size();
    vector<vector<double>> dist(n, vector<double>(n, 0.0));

    for (int i = 0; i < n; ++i) {
        for (int j = 0; j < n; ++j) {
            if (i != j) {
                dist[i][j] = calcDist(cities[i], cities[j]);
            }
        }
    }

    return dist;
}

vector<int> nearestNeighbor(const vector<vector<double>>& dist, int startCity = 0) {
    int n = dist.size();
    vector<bool> visited(n, false);
    vector<int> path;

    path.push_back(startCity);
    visited[startCity] = true;

    for (int i = 1; i < n; ++i) {
        int lastCity = path.back();
        int nearestCity = -1;
        double minDist = 1e18;

        for (int j = 0; j < n; ++j) {
            if (!visited[j] && dist[lastCity][j] < minDist) {
                minDist = dist[lastCity][j];
                nearestCity = j;
            }
        }

        path.push_back(nearestCity);
        visited[nearestCity] = true;
    }

    path.push_back(path[0]);
    return path;
}

double calcLength(const vector<vector<double>>& dist, const vector<int>& tour) {
    double length = 0.0;
    for (int i = 0; i < (int)tour.size() - 1; ++i) {
        length += dist[tour[i]][tour[i + 1]];
    }
    return length;
}

vector<int> optimize2Opt(const vector<vector<double>>& dist, vector<int> tour) {
    bool improved = true;
    int n = tour.size();

    while (improved) {
        improved = false;

        for (int i = 1; i < n - 2; ++i) {
            for (int j = i + 1; j < n - 1; ++j) {
                int a = tour[i - 1], b = tour[i];
                int c = tour[j], d = tour[j + 1];
                double current = dist[a][b] + dist[c][d];
                double potential = dist[a][c] + dist[b][d];

                if (potential < current) {
                    reverse(tour.begin() + i, tour.begin() + j + 1);
                    improved = true;
                }
            }
        }
    }

    return tour;
}

pair<vector<int>, double> solve(const vector<vector<double>>& dist) {
    vector<int> bestTour;
    double bestLength = 1e18;
    int n = dist.size();

    for (int start = 0; start < n; ++start) {
        vector<int> tour = nearestNeighbor(dist, start);
        tour = optimize2Opt(dist, tour);
        double length = calcLength(dist, tour);

        if (length < bestLength) {
            bestLength = length;
            bestTour = tour;
        }
    }

    return { bestTour, bestLength };
}

int main() {
    auto start = std::chrono::high_resolution_clock::now();

    int n;
    cin >> n;

    vector<pair<int, int>> cities(n);
    for (int i = 0; i < n; ++i) {
        cin >> cities[i].first >> cities[i].second;
    }

    auto dist = createMatrix(cities);
    auto result = solve(dist);
    vector<int> path = result.first;
    double path_length = result.second;

    cout << "[ ";
    for (int i = 0; i < (int)path.size() - 2; ++i) {
        cout << path[i] << ", ";
    }
    cout << path[path.size() - 2] << " ]\n";
    cout << path_length << '\n';

    auto end = std::chrono::high_resolution_clock::now();
    auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);

    cout << duration.count() << '\n';

    return 0;
}