from functools import lru_cache
from operator import itemgetter
from statistics import mean


def longest_common_substring(x: str, y: str) -> (int, int, int):
    @lru_cache(maxsize=1)
    def longest_common_prefix(i: int, j: int) -> int:
        if 0 <= i < len(x) and 0 <= j < len(y) and x[i] == y[j]:
            return 1 + longest_common_prefix(i + 1, j + 1)
        else:
            return 0

    def diagonal_computation():
        for k in range(len(x)):
            yield from ((longest_common_prefix(i, j), i, j)
                        for i, j in zip(range(k, -1, -1),
                                        range(len(y) - 1, -1, -1)))
        for k in range(len(y)):
            yield from ((longest_common_prefix(i, j), i, j)
                        for i, j in zip(range(k, -1, -1),
                                        range(len(x) - 1, -1, -1)))

    return max(diagonal_computation(), key=itemgetter(0), default=(0, 0, 0))


def lcs_of_array(arr):
    """
    :param arr: Array of strings where LCS is to be found
    :return: Longest common substring of the array
    """
    lcs = arr[0]
    for s in range(1, len(arr)):
        length, i, j = longest_common_substring(lcs, arr[s])
        lcs = lcs[i:i + length]
    return lcs


def calculate_average(arr):
    """
    :param arr: Array for which average is to be calculated
    :return: Average of the array
    """
    if len(arr) == 0:
        return 0
    return round(mean(arr))
