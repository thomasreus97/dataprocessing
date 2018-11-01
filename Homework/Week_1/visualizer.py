#!/usr/bin/env python
# Name: Thomas Reus
# Student number: 11150041
"""
This script visualizes data obtained from a .csv file
"""

import csv
import matplotlib.pyplot as plt

# Global constants for the input file, first and last year
INPUT_CSV = "movies.csv"
START_YEAR = 2008
END_YEAR = 2018

# Global dictionary for the data
data_dict = {str(key): [] for key in range(START_YEAR, END_YEAR)}

if __name__ == "__main__":

    # open CSV file and load year + grade into data_dict
    with open(INPUT_CSV, newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        for i in reader:
            data_dict[i['Year']].append(float(i['Rating']))

    # line plot of average rating vs year
    x = []
    y = []
    for i in data_dict:
        x.append(i)
        y.append(sum(data_dict[i])/len(data_dict[i]))
    plt.plot(x, y)
    plt.title("Average rating vs year of top 50 movies")
    plt.xlabel("Year")
    plt.ylabel("Average rating")
    plt.show()

    # print data_dict
    print(data_dict)
