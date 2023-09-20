import pandas as pd

# Reading data
df_wine = pd.read_csv('./src/winemag-data-130k-v2.csv', index_col=0)
df_countries = pd.read_csv('./src/country_codes.csv')

# Dropping empty countries
print("Lenght of dataset before drop:", len(df_wine))
df_wine.dropna(subset=["country"], inplace=True)
print("Lenght of dataset after drop:", len(df_wine))

# Cleaning United States name
df_wine['country'].replace('US', 'United States of America', inplace=True)

# Grouping wine points by country
pts_by_ctry = df_wine.groupby('country', as_index=False).agg({'points': 'sum'})

# Cleaning iso column
df_countries['iso'] = df_countries['iso_3166-2'].str.split(pat=":", expand=True)[1]
df_countries.set_index(keys='name', inplace=True)

# Mapping iso to country name
pts_by_ctry['iso'] = pts_by_ctry['country'].map(df_countries['iso'])

# Reordering columns
pts_by_ctry = pts_by_ctry[['iso', 'country', 'points']]

# Exporting dataset
pts_by_ctry.to_csv('points_by_country.csv', index=False, header=True)





