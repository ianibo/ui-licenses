export default (options) => (queryParams, pathComponents, resources) => {
  const {
    searchKey = '',
    columnMap = {},
  } = options;

  const params = {
    stats: 'true',
  };

  const { query: { query, filters, sort } } = resources;

  if (query) {
    params.match = searchKey;
    params.term = query;
  }

  if (filters) {
    params.filters = [];

    // Split up the `filters` query string into individual filters
    // and group them if they're filtering on the same property.
    const filterMap = {};
    filters.split(',').forEach(filter => {
      const [propertyName, label] = filter.split('.');
      if (!filterMap[propertyName]) filterMap[propertyName] = [];

      filterMap[propertyName].push(label);
    });

    // Construct the actual `filters` query string we're going to use.
    // Note that multiple filters on the same property must be joined
    // together into the same param to act as a union rather than an intersection.
    // e.g., filters=["status.label==Draft||status.label==Active", "priority.label==High"]
    Object.entries(filterMap).forEach(([name, values]) => {
      const filter = values
        .map(value => `${name}.label==${value}`)
        .join('||');

      params.filters.push(filter);
    });
  }

  if (sort) {
    params.sort = sort.split(',').map(sortKey => {
      const descending = sortKey.startsWith('-');
      const term = sortKey.replace('-', '');
      const key = columnMap[term] || term;

      return `${key};${descending ? 'desc' : 'asc'}`;
    });
  }

  return params;
};
