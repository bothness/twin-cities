# Explore twin cities

An experimental tool for exploring twin cities of the world as a network map. You can [find the tool here](https://bothness.github.io/twin-cities/).

## Using the code

This tool is a Svelte app. You can run it locally by cloning this repo and then running the following commands (assuming you have NodeJS installed):

```bash
npm install
npm run dev
```

To build the app for deployment as static HTML/CSS/JS, you can run the following command, which will write the relevant files to the ***/dist*** directory:

```bash
npm run build
```

## Get the data

The data behind this tool is extracted from Wikidata. You can download the [nodes (cities) here](https://bothness.github.io/twin-cities/data/nodes.tsv) and the [edges (connections) here](https://bothness.github.io/twin-cities/data/links.tsv).The format of these files is TSV (tab-separated values), which can be opened in any spreadsheet software.
