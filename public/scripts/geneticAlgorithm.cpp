#include <cstdlib>
#include <iostream>
#include <random>
#include <utility>
#include <vector>
#include <numeric>
#include <algorithm>
#include <cmath>
#include <fstream>
#include <chrono>
#include <unordered_map>
#include <functional>

using namespace std;


mt19937 rnd(179);


ofstream outFile("epochs.txt");


unordered_map<string, long double> distanceCache;


struct POINT{
  int x;
  int y;
  
  POINT() {}

  POINT(int a, int b): x(a), y(b) {}
};


vector<POINT> points;


int randomVal(int min, int max) {
  return min + rnd() % (max - min);
}


vector<int> randomPermutation(int pointsCNT) {
  vector<int> permutation(pointsCNT);
  iota(permutation.begin(), permutation.end(), 0);

  shuffle(permutation.begin() + 1, permutation.end(), rnd);
  
  return permutation;
}


vector<vector<int>> createPopulation(int populationCNT, int pointsCNT) {
  vector<vector<int>> population;

  for (int i = 0; i < populationCNT; ++i) {
    population.push_back(randomPermutation(pointsCNT));
  }

  return population;
}


vector<int> createChild(const vector<int>& dad, const vector<int>& mom, int copyGen, int maxCopy)  {
  int n = dad.size();

  vector<bool> gen(n, 0);
  vector<int> ret(n, 0);
  
  for (int i = 0; i < copyGen; ++i) {
    int left = randomVal(1, n);
    int right = randomVal(left, min(n + 1, left + randomVal(1, maxCopy)));

    if (rnd() % 10 < 5) {
      for (int j = 0; j < right - left; ++j) {
        if (gen[dad[left + j]] || ret[left + j]) continue;

        ret[left + j] = dad[left + j];
        gen[dad[left + j]] = 1;
      }
    } else {
      for (int j = 0; j < right - left; ++j) {
        if (gen[dad[left + j]] || ret[right - j - 1]) continue;

        ret[right - j - 1] = dad[left + j];
        gen[dad[left + j]] = 1;
      }
    }
  }

  int i = 1, j = 1;
  while (i < n) {
    if (gen[mom[i]]) {
      ++i;
      continue;
    }

    while (ret[j] != 0) {
      ++j;
    }

    ret[j] = mom[i];
    ++i;
  }

  return ret;
}


void reverseGen(vector<int>& individ, int ind, int length) {
  for (int i = 0; i < length / 2; ++i) {
    swap(individ[ind + i], individ[i + length - 1 - i]);
  }
}


void swapGenPart(vector<int>& individ, int i1, int i2, int length) {
  for (int i = 0; i < length; ++i) {
    swap(individ[i1 + i], individ[i2 + i]);
  }

  if (rnd() % 100 < 20)
    reverseGen(individ, i1, length);
  if (rnd() % 100 < 20)
    reverseGen(individ, i2, length);
}


vector<int> mutate(vector<int> individual, int gens) {
  int n = (int)individual.size();

  for (int i = 0; i < gens; ++i) {
    int i1 = randomVal(1, n);
    int i2 = randomVal(1, n);
    if (i1 == i2)
      continue;
    
    int lenght = randomVal(0, min(min(min(n - i1, n - i2), abs(i1 - i2)), 3));
    swapGenPart(individual, i1, i2, lenght);

    if (rnd() % 100 < 20)
      reverseGen(individual, i1, lenght);
    if (rnd() % 100 < 20)
      reverseGen(individual, i2, lenght);
  }

  return individual;
}


vector<int> mutateSimple(vector<int> individual, int gens) {
  int n = individual.size();
  for (int i = 0; i < gens; ++i) {
    int left = randomVal(1, n);
    int right = randomVal(1, n);
    swap(individual[left], individual[right]);
  }

  return individual;
}


long double distanse(const vector<int>& a) {
  string key;
  for (int point : a) {
      key += to_string(point) + ",";
  }
  
  auto it = distanceCache.find(key);
  if (it != distanceCache.end()) {
      return it->second;
  }

  long double dist = 0;
  int n = a.size();
  
  for (int i = 1; i < n; ++i) {
    int diffX = points[a[i]].x - points[a[i - 1]].x;
    int diffY = points[a[i]].y - points[a[i - 1]].y;
    dist += sqrt((long double)((long long)diffX * diffX + (long long)diffY * diffY));
  }

  int diffX = points[a[0]].x - points[a[n - 1]].x;
  int diffY = points[a[0]].y - points[a[n - 1]].y;
  dist += sqrt((long double)(diffX * diffX + diffY * diffY));

  return dist; 
}


bool compareByDistanse(const vector<int>& a, const vector<int>& b) {
  long double distA = distanse(a);
  long double distB = distanse(b);

  return distA < distB;
}


int battleRoyal(const vector<vector<int>>& population) {
  int n = population.size();
  int goodParent = randomVal(0, n);

  for (int i = 0; i < 5; ++i) {
    int newParent = randomVal(0, n);
    if (compareByDistanse(population[newParent], population[goodParent])) {
      goodParent = newParent;
    }
  }

  return goodParent;
}

void killNoobs(vector<vector<int>>& populataion, int populationCNT, int eliteCNT) {
  sort(populataion.begin(), populataion.end(), compareByDistanse);
  
  int n = populataion.size();
  for (int i = eliteCNT; i < populationCNT; ++i) {
    swap(populataion[i], populataion[randomVal(i, n)]);
  }

  if (populationCNT < (int)populataion.size()) {
    populataion.erase(populataion.begin() + populationCNT, populataion.end());
  }
}

void mutation(vector<vector<int>>& population, int populationCNT, int mutationCNT, int eliteCNT) {
  for (int i = 0; i < mutationCNT; ++i) {
    int n = (int)population.size();  
    if (rnd() % 10 < 4)
      population.push_back(mutate(population[randomVal(0, n)], randomVal(0, 4)));
    else
      population.push_back(mutateSimple(population[randomVal(0, n)], randomVal(1, 3)));

    if ((int)population.size() > 5 * populationCNT / 2) {
      killNoobs(population, 3 * populationCNT / 2, eliteCNT);
    }
  }
}

void crossBreeding(vector<vector<int>>& population, int populationCNT, int childrenCNT, int eliteCNT) {
  for (int i = 0; i < childrenCNT; ++i) {
    int stepFather = battleRoyal(population);
    int stepDaughter = battleRoyal(population);

    population.push_back(createChild(population[stepFather], population[stepDaughter], randomVal(1, 3), 6));

    if ((int)population.size() > 5 * populationCNT / 2) {
      killNoobs(population, 3 * populationCNT / 2, eliteCNT);
    }
  }

  return;  
}

void printPopulation(vector<vector<int>>& population, int outputCNT) {
  sort(population.begin(), population.end(), compareByDistanse);
  outFile << "[ ";
  for (int i = 0; i < outputCNT; ++i) {
    outFile << "[ ";
    for (int j = 0; j < (int)population[i].size(); ++j) {
      outFile << population[i][j];
      if (j < (int)population[i].size() - 1)
        outFile << ", ";
    }
    outFile << " ]";
    if (i < outputCNT - 1) {
      outFile << ", ";
    }
  }
  outFile << " ]" << endl;
}


int main() {
  auto start = std::chrono::high_resolution_clock::now();

  int pointsCNT, populationCNT, epochsCNT, outputCNT;
  cin >> pointsCNT >> populationCNT >> epochsCNT >> outputCNT;

  int childrenCNT, mutationCNT, eliteCNT;
  cin >> childrenCNT >> mutationCNT >> eliteCNT;
  
  for (int i = 0; i < pointsCNT; ++i) {
    int x, y;
    cin >> x >> y;

    points.emplace_back(x, y);
  }

  vector<vector<int>> population = createPopulation(populationCNT, pointsCNT);
  for (int i = 0; i < epochsCNT; ++i) {
    crossBreeding(population, populationCNT, childrenCNT, eliteCNT);

    mutation(population, populationCNT, mutationCNT, eliteCNT);

    killNoobs(population, populationCNT, eliteCNT);

    printPopulation(population, outputCNT);
  }

  outFile.close();
  
  vector<int> populationBest = population[0];
  cout << "[ ";
  for (int i = 0; i < (int)populationBest.size() - 1; ++i) {
      cout << populationBest[i] << ", ";
  }
  cout << populationBest[populationBest.size() - 1] << " ]\n";

  auto end = std::chrono::high_resolution_clock::now();
  auto duration_ms = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);

  cout << distanse(populationBest) << '\n';
  cout << duration_ms.count() << '\n';

  distanceCache.clear();

  return 0;
}
