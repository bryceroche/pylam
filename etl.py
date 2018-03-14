import psycopg2
import pygrametl
from pygrametl.datasources import SQLSource, CSVSource
from pygrametl.tables import Dimension, FactTable

sales_string = "host='10.0.0.12' dbname='sale' user='user' password='pass'"
sales_pgconn = psycopg2.connect(sales_string)

dw_string = "host='10.0.0.13' dbname='dw' user='dwuser' password='dwpass'"
dw_pgconn = psycopg2.connect(dw_string)
dw_conn_wrapper = pygrametl.ConnectionWrapper(connection=dw_pgconn)

name_mapping= 'book', 'genre', 'city', 'timestamp', 'sale'
sales_source = SQLSource(connection=sales_pgconn, \
                         query="SELECT * FROM sales", names=name_mapping)

region_file_handle = open('region.csv', 'r', 16384)
region_source = CSVSource(csvfile=region_file_handle, delimiter=',')

book_dimension = Dimension(
    name='book',
    key='bookid',
    attributes=['book', 'genre'])

time_dimension = Dimension(
    name='time',
    key='timeid',
    attributes=['day', 'month', 'year'])

location_dimension = Dimension(
    name='location',
    key='locationid',
    attributes=['city', 'region'],
    lookupatts=['city'])

fact_table = FactTable(
    name='facttable',
    keyrefs=['bookid', 'locationid', 'timeid'],
    measures=['sale'])

def split_timestamp(row):
    timestamp = row['timestamp']
    timestamp_split = timestamp.split('/')

    row['year'] = timestamp_split[0]
    row['month'] = timestamp_split[1]
    row['day'] = timestamp_split[2]

[location_dimension.insert(row) for row in region_source]
region_file_handle.close()
for row in sales_source:
    split_timestamp(row)
    row['bookid'] = book_dimension.ensure(row)
    row['timeid'] = time_dimension.ensure(row)

    row['locationid'] = location_dimension.lookup(row)
    if not row['locationid']:
       raise ValueError("city was not present in the location dimension")

    fact_table.insert(row)

dw_conn_wrapper.commit()
dw_conn_wrapper.close()


sales_pgconn.close()