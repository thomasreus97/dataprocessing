"""
Name: Thomas Reus
Student-id: 11150041

Problem: DataProcessing
         Homework Week 2
         EDA

This program does:
- loads certain information of
  a csv file into a dictionary.
- Creates a pandas dataframe and
  a .json file from this dictionary.
- Pandas: does some statistics on the
  data (central tendency, 5 number summary,
        histogram, boxplot, scatterplot).
"""

import csv
import json
import pandas as pd
import matplotlib.pyplot as plt


def open_csv(input):
    """
    Opens a csv file with DictReader
    and returns a list with dictionaries.

    Input: .csv file (input)

    Output: list with a dictionary for
            every country (dictionary)
    """

    # create empty list
    dictionary = []

    # open CSV file and load into dictionary
    with open('input.csv', newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        for i in reader:
            dictionary.append(i)

    # return dictionary
    return dictionary


def desired_dictionary(csv_dicts, vars):
    """
    Creates a dictionary with key:
    country containing a dictionary with
    keys for all desired variables.

    Input: - list with a dictionary for every
             country (csv_dicts)
           - list with desired variables (vars)

    Output: dictionary with key: country
            containing a dictionary (info_dict)
    """

    # create empty dictionary
    info_dict = {}

    # iterate over dictionaries in input
    for i in csv_dicts:
        # create and fill dictionary for every country with desired info
        info_dict[i[vars[0]]] = {}
        for j in vars[1:]:
            # check for inconsistencies and remove data when so
            if check_empty(i[j], j):
                info_dict.pop(i[vars[0]])
                break
            else:
                # do some changes on the data and add to dictionary
                if not i[j].isupper():
                    input_item = float(i[j].split(' ')[0].replace(',', '.'))
                    info_dict[i[vars[0]]][j] = input_item
                else:
                    info_dict[i[vars[0]]][j] = i[j].split('   ')[0]

    # return information dictionary
    return info_dict


def check_empty(item, type):
    """
    Checks for inconsistencies in the
    needed data.

    Input: - Data (item)
           - Type of data (type)

    Output: Boolian
    """

    # check for empty and unknown
    if item == 'unknown' or item == '':
        return True

    # remove extreme data GDP
    elif type == 'GDP ($ per capita) dollars' and \
            float(item.split(' ')[0]) > 200000:
        return True

    # everything is fine
    else:
        return False


def central_tendency(pandas_frame, data_type):
    """
    Calculate the central tendency and
    create a histogram from one column in
    the pandas dataframe.

    Input: - Pandas dataframe (pandas_frame)
           - Column (data_type)

    Output: - Histogram plot of column
            - List with central tendency
              (mean, median, mode, stdev).
    """

    # take the column from dataframe
    item = pandas_frame[data_type]

    # calculate central tendency
    mean = item.mean()
    median = item.median()
    mode = item.mode()[0]
    stdev = item.std()

    # create histogram
    plt.figure('histogram')
    item.hist(bins=100)
    plt.title(f"histogram of {data_type}")
    plt.xlabel(data_type)
    plt.ylabel("Frequency")

    # return central tendency
    return [mean, median, mode, stdev]


def five_number_summary(pandas_frame, data_type):
    """
    Calculate the five number summary and
    create a boxplot from one column in
    the pandas dataframe.

    Input: - Pandas dataframe (pandas_frame)
           - Column (data_type)

    Output: - Boxplot of column
            - List with five number summary
              (minimum, quart_1, median, quart_3, maximum).
    """

    # take the column from dataframe
    item = pandas_frame[data_type]

    # calculate five number summary
    minimum = item.min()
    maximum = item.max()
    quart_1 = item.quantile(q=0.25)
    median = item.quantile()
    quart_3 = item.quantile(q=0.75)

    # create Boxplot
    plt.figure('boxplot')
    pandas_frame.boxplot(column=data_type)

    # return five number summary
    return [minimum, quart_1, median, quart_3, maximum]


def scatter_plot_region(pandas_frame, value_x, value_y):
    """
    Creates a region-based scatterplot
    between two values.

    Input: - Pandas dataframe (pandas_frame)
           - Columns for values
             (value_x, value_y)

    Output: Scatterplot
    """

    # create plot
    f, (ax1, ax2) = plt.subplots(2, sharex=True, sharey=True)

    # iterate over unique regions
    for region in pandas_frame['Region'].unique():
        data = pandas_frame[pandas_frame.Region == region]
        # plot scatter plot for certain region
        ax1.scatter(data[value_x], data[value_y], label=region)
        # plot average per region
        ax2.scatter(data[value_x].mean(), data[value_y].mean())

    # add titles and labels
    ax1.set_title(f"Region-based scatterplot between {value_x} and {value_y}")
    ax1.set_ylabel(value_y)
    ax2.set_title(f"Average per region scatterplot between {value_x} and {value_y}")
    ax2.set_xlabel(value_x)
    ax2.set_ylabel(value_y)
    ax1.legend()


# main function
if __name__ == "__main__":

    # open csv file
    csv_dicts = open_csv('input.csv')

    # desired variables list from csv data
    vars = [
        'Country',
        'Region',
        'Pop. Density (per sq. mi.)',
        'Infant mortality (per 1000 births)',
        'GDP ($ per capita) dollars',
    ]

    # create dictionary with desired information
    info_dict = desired_dictionary(csv_dicts, vars)

    # create pandas frame
    pandas_frame = pd.DataFrame.from_dict(info_dict, orient='index')

    # calculate central tendency + plot histogram
    central_t_gdp = central_tendency(pandas_frame, vars[4])

    # calculate five number summary + plot boxplot
    five_num_inf = five_number_summary(pandas_frame, vars[3])

    # save information dictionary into .json file
    with open('info_dict.json', 'w') as fp:
        json.dump(info_dict, fp, indent=4)

    # extra: scatterplot region based
    scatter_plot_region(pandas_frame, vars[4], vars[3])

    # show graphs
    plt.show()
