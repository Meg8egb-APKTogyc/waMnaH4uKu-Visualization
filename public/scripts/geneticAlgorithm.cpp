#include <cstdlib>
#include <iostream>
#include <random>
#include <utility>
#include <vector>
#include <numeric>
#include <algorithm>
#include <cmath>


using namespace std;


mt19937 rnd(179);


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
    int left = randomVal(0, n);
    int right = randomVal(left, min(n, left + randomVal(1, maxCopy)));
    for (int j = left; j < right; ++j) {
      ret[j] = dad[j];
      gen[dad[j]] = 1;
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


void swapGenPart(vector<int>& individ, int i1, int i2, int length) {
  int n = individ.size();

  for (int i = 0; i < length; ++i) {
    swap(individ[i1 + i], individ[i2 + i]);
  }
}


vector<int> mutate(vector<int> individual, int gens) {
  int n = (int)individual.size();

  for (int i = 0; i < gens; ++i) {
    int i1 = randomVal(1, n);
    int i2 = randomVal(1, n);
    if (i1 == i2)
      continue;
    
    int len = randomVal(0, min(min(min(n - i1, n - i2), abs(i1 - i2)), 3));
    swapGenPart(individual, i1, i2, len);
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


void mutation(vector<vector<int>>& population, int mutationCNT) {
  int n = (int)population.size();
  
  for (int i = 0; i < mutationCNT; ++i) {
    if (rnd() % 10 > 4)
      population.push_back(mutate(population[randomVal(0, n)], randomVal(0, 4)));
    else
      population.push_back(mutateSimple(population[randomVal(0, n)], randomVal(1, 3)));
  }
}

void crossBreeding(vector<vector<int>>& population, int pairsCNT) {
  int n = population.size();

  for (int i = 0; i < pairsCNT; ++i) {
    population.push_back(createChild(population[randomVal(0, n)], population[randomVal(0, n)], randomVal(1, 3), 4));
  }

  return;  
}


long double distanse(const vector<int>& a) {
  long double dist = 0;
  int n = a.size();
  
  for (int i = 1; i < n; ++i) {
    int diffX = points[a[i]].x - points[a[i - 1]].x;
    int diffY = points[a[i]].y - points[a[i - 1]].y;
    dist += sqrt((long double)(diffX * diffX + diffY * diffY));
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


void killNoobs(vector<vector<int>>& populataion, int populationCNT, int savePros) {
  sort(populataion.begin(), populataion.end(), compareByDistanse);
  
  int n = populataion.size();
  for (int i = savePros; i < populationCNT; ++i) {
    swap(populataion[i], populataion[randomVal(i, n)]);
  }

  while (populationCNT < populataion.size()) {
    populataion.pop_back();
  }
}


void printPro(vector<vector<int>>& population, int outputCNT) {
  sort(population.begin(), population.end(), compareByDistanse);

  for (int i = 0; i < outputCNT; ++i) {
    for (int j = 0; j < population[i].size(); ++j) {
      cout << population[i][j] << ' ';
    }
  }
}


int main() {
  int pointsCNT, populationCNT, epochsCNT, outputCNT;
  cin >> pointsCNT >> populationCNT >> epochsCNT >> outputCNT;
  
  for (int i = 0; i < pointsCNT; ++i) {
    int x, y;
    cin >> x >> y;

    points.emplace_back(x, y);
  }

  vector<vector<int>> population = createPopulation(populationCNT, pointsCNT);
  for (int i = 0; i < epochsCNT; ++i) {
    mutation(population, populationCNT);

    killNoobs(population, 3 * populationCNT / 2, randomVal(2, 5));

    crossBreeding(population, populationCNT);

    killNoobs(population, populationCNT, randomVal(2, 5));

    printPro(population, outputCNT);
  }

  return 0;
}
