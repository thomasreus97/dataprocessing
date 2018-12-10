"""
Name: Thomas Reus
Student-id: 11150041

Problem: DataProcessing
         Homework Week 3
         Data Line

This program does:
- Creates a dictionary from the
  .csv file
- Creates a .json file from the
  dictionary
"""

import csv
import json

# name of the input file (without .csv)
INPUT_NAME = "data"

def create_dictionary(input_csv):
    """
    Creates a dictionary from a
    .csv file.
    Input: .csv file (input_csv)
    Output: dictionary (csv_dict)
    """
    # create empty csv dictionary
    csv_dict = {}

    # open CSV file and load into list
    dictionary = []
    with open(input_csv, newline='') as csvfile:
        reader = csv.DictReader(csvfile, delimiter=';')
        for item in reader:
            dictionary.append(item)

    # create index names
    vars = []
    for name in dictionary[0]:
        vars.append(name)

    # create dictionary for every year
    for item in dictionary:
        csv_dict[item[vars[2]]] = {}

    # add all data from a province to each year
    for item in dictionary:
        csv_dict[item[vars[2]]][item[vars[3]]] = {}
        for var in vars[4:]:
            csv_dict[item[vars[2]]][item[vars[3]]][var] = item[var]
    print(csv_dict)

    # return dictionary
    return csv_dict


# main function
if __name__ == "__main__":

    # create dictionary from csv file
    dictionary = create_dictionary(f"{INPUT_NAME}.csv")

    # create json file from the dictionary
    with open(f"{INPUT_NAME}.json", 'w') as fp:
        json.dump(dictionary, fp, indent=4)
