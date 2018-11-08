import csv
import json

def open_csv(input):
    # open CSV file and load into dictionary
    dictionary = []
    with open('input.csv', newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        for i in reader:
            dictionary.append(i)
    return(dictionary)

if __name__ == "__main__":

    csv_dicts = open_csv('input.csv')

    info_dict = {}
    c = 'Country'
    r = 'Region'
    pd = 'Pop. Density (per sq. mi.)'
    im = 'Infant mortality (per 1000 births)'
    gdp = 'GDP ($ per capita) dollars'

    for i in csv_dicts:
        info_dict[i[c]] = {}
        info_dict[i[c]][r] = i[r]
        info_dict[i[c]][pd] = i[pd]
        info_dict[i[c]][im] = i[im]
        info_dict[i[c]][gdp] = i[gdp]

    for i in info_dict:
        print(f"{i}: {info_dict[i][pd]}")
