"""
Name: Thomas Reus
Student-id: 11150041

Problem: DataProcessing
         Homework Week 3
         Data Line

This program does:
- Converts .txt file into .csv
- Creates a dictionary from the
  .csv file
- Creates a .json file from the
  dictionary
"""

import csv
import json

# name of the input file (without .txt or .csv)
INPUT_NAME = "KNMI_20180101"


def convert_txt_to_csv(file_name):
    """
    Creates a .csv file from a .txt
    file (origin .txt file = KNMI)
    Input: name of .txt file (file_name)
    Output .csv file
    """
    # open the .txt file and strip lines
    with open(f"{file_name}.txt", "r") as input:
        stripped_lines = (line.strip() for line in input)

        # take the required data and process it
        titles = []
        data = []
        for line in stripped_lines:
            # get the column titles
            if '=' in line:
                line = line.replace("# ", "")
                line = line.replace(";", "")
                line = line.split(" = ")[-1].strip()
                titles.append(line)
            # skip unneeded data
            elif line[0] == "#":
                continue
            # split data into list
            else:
                line = line.split(",")
                data.append(line[1:])

        # create and write csv file
        with open(f"{file_name}.csv", 'w') as output:
            csv_write = csv.writer(output)
            csv_write.writerows([titles])
            csv_write.writerows(data)
    return


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
        reader = csv.DictReader(csvfile)
        for item in reader:
            dictionary.append(item)

    # create index names
    vars = []
    for name in dictionary[0]:
        vars.append(name)

    # fill the csv dict with a dictionary per item
    for item in dictionary:
        csv_dict[item[vars[0]]] = {}
        for var in vars[1:]:
            csv_dict[item[vars[0]]][var] = int(item[var])

    # return dictionary
    return csv_dict


# main function
if __name__ == "__main__":

    # convert txt file from KNMI into csv format (when needed)
    convert_txt_to_csv(INPUT_NAME)

    # create dictionary from csv file
    dictionary = create_dictionary(f"{INPUT_NAME}.csv")

    # create json file from the dictionary
    with open(f"{INPUT_NAME}.json", 'w') as fp:
        json.dump(dictionary, fp, indent=4)
