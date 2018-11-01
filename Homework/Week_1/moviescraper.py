#!/usr/bin/env python
# Name: Thomas Reus
# Student number: 11150041
"""
This script scrapes IMDB and outputs a CSV file with highest rated movies.
"""

import csv
from requests import get
from requests.exceptions import RequestException
from contextlib import closing
from bs4 import BeautifulSoup

TARGET_URL = "https://www.imdb.com/search/title?title_type=feature&release_date=2008-01-01,2018-01-01&num_votes=5000,&sort=user_rating,desc"
BACKUP_HTML = 'movies.html'
OUTPUT_CSV = 'movies.csv'


def extract_movies(dom):
    """
    Extract a list of highest rated movies from DOM (of IMDB page).
    Each movie entry should contain the following fields:
    - Title
    - Rating
    - Year of release (only a number!)
    - Actors/actresses (comma separated if more than one)
    - Runtime (only a number!)
    """
    # make empty lists for information
    titles = []
    ratings = []
    years = []
    actors = []
    actor_list = []
    runtimes = []

    # get <a> headers from dom
    a_list = dom.find_all('a')
    # get <div> headers from dom
    div_list = dom.find_all('div')
    # get <span> headers from dom
    span_list = dom.find_all('span')

    # iterate over <a> headers
    for i in a_list:
        if i.get('href'):
            # add titles to list titles
            if ('/title/' and 'adv_li_tt') in i.get('href'):
                titles.append(i.string)
                # add years to years list
                year = i.next_sibling.next_sibling.string
                for j in year:
                    if j in '() I':
                        year = year.replace(j, '')
                years.append(year)
            # add actor names
            if ('/name/' and '?ref_=adv_li_st') in i.get('href'):
                if len(titles) == len(actors) + 1:
                    actor_list.append(i.string)
                else:
                    actors.append(actor_list)
                    actor_list = []
    # add last actors list
    actors.append(actor_list)

    # iterate over <div> headers
    for i in div_list:
        # append rating
        if i.get('data-value'):
            ratings.append(i.get('data-value'))

    # iterate over <span> headers
    for i in span_list:
        # add runtime to list
        if 'class' in i.attrs and 'runtime' in i.attrs['class']:
            runtimes.append(i.string.split(' ')[0])

    # return all information
    return [titles, ratings, years, actors, runtimes]


def save_csv(outfile, movies):
    """
    Output a CSV file containing highest rated movies.
    """
    writer = csv.writer(outfile)
    writer.writerow(['Title', 'Rating', 'Year', 'Actors', 'Runtime'])

    for i in range(len(movies[0])):
        writer.writerow([movies[0][i], movies[1][i], movies[2][i], movies[3][i],
                         movies[4][i]])


def simple_get(url):
    """
    Attempts to get the content at `url` by making an HTTP GET request.
    If the content-type of response is some kind of HTML/XML, return the
    text content, otherwise return None
    """
    try:
        with closing(get(url, stream=True)) as resp:
            if is_good_response(resp):
                return resp.content
            else:
                return None
    except RequestException as e:
        print('The following error occurred during HTTP GET request to {0} : {1}'.format(url, str(e)))
        return None


def is_good_response(resp):
    """
    Returns true if the response seems to be HTML, false otherwise
    """
    content_type = resp.headers['Content-Type'].lower()
    return (resp.status_code == 200
            and content_type is not None
            and content_type.find('html') > -1)


if __name__ == "__main__":

    # get HTML content at target URL
    html = simple_get(TARGET_URL)

    # save a copy to disk in the current directory, this serves as an backup
    # of the original HTML, will be used in grading.
    with open(BACKUP_HTML, 'wb') as f:
        f.write(html)

    # parse the HTML file into a DOM representation
    dom = BeautifulSoup(html, 'html.parser')

    # extract the movies (using the function you implemented)
    movies = extract_movies(dom)

    # write the CSV file to disk (including a header)
    with open(OUTPUT_CSV, 'w', newline='') as output_file:
        save_csv(output_file, movies)
