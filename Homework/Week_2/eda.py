import csv
import json
import pandas as pd
import statistics
import matplotlib.pyplot as plt
import numpy as np


def open_csv(input):
    # open CSV file and load into dictionary
    dictionary = []
    with open('input.csv', newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        for i in reader:
            dictionary.append(i)
    return(dictionary)


def desired_dictionary(csv_dicts, vars):
    info_dict = {}
    for i in csv_dicts:
        info_dict[i[vars[0]]] = {}
        for j in vars[1:]:
            if check_empty(i[j]):
                info_dict.pop(i[vars[0]])
                break
            else:
                if not i[j].isupper():
                    info_dict[i[vars[0]]][j] = float(i[j].split(' ')[0].replace(',', '.'))
                else:
                    info_dict[i[vars[0]]][j] = i[j]
    return info_dict


def check_empty(item):
    if item == 'unknown' or item == '':
        return True
    else:
        return False


def central_tendency(pandas_frame, data_type):
    list = []
    item = pandas_frame.loc[:, data_type]
    # for i in pandas_frame[data_type]:
    #     list.append(float(i.split(' ')[0].replace(',', '.')))

    mean = item.mean()
    median = item.median()
    mode = item.mode()[0]
    stdev = item.std()

    # plt.hist(list, bins=50)
    # plt.xlabel(data_type)
    # plt.ylabel("Frequency")
    # plt.title(f"Histrogram of {data_type}")
    # plt.show()

    return [mean, median, mode, stdev]


def five_number_summary(pandas_frame, data_type):
    list = []
    for i in pandas_frame[data_type]:
        list.append(float(i.split(' ')[0].replace(',', '.')))
    minimum = np.min(list)
    maximum = np.max(list)
    quart_1, median, quart_3 = np.percentile(list, [25, 50, 75])
    pandas_frame.boxplot(by=index,
                       column=[data_type],
                       grid=False)

    return [minimum, quart_1, median, quart_3, maximum]

if __name__ == "__main__":

    csv_dicts = open_csv('input.csv')

    vars = ['Country', 'Region', 'Pop. Density (per sq. mi.)',
            'Infant mortality (per 1000 births)', 'GDP ($ per capita) dollars']

    info_dict = desired_dictionary(csv_dicts, vars)

    # info_dict = str(info_dict)
    # with open('info_dict.txt', 'w') as file:
    #     file.write(info_dict)

    pandas_frame = pd.DataFrame.from_dict(info_dict, orient='index')
    pandas_frame.to_csv('pandas.csv', sep='\t')
    # print(pandas_frame.loc[:, vars[-1]].describe())
    central_t_gdp = central_tendency(pandas_frame, vars[4])
    # print(central_t_gdp)
    # five_num_inf = five_number_summary(pandas_frame, vars[3])
    # print(five_num_inf)
