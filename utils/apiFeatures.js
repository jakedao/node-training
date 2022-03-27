class APIFeatures {
  constructor(query, queryObj) {
    this.query = query;
    this.queryObj = queryObj;
  }

  filter() {
    const queryParams = { ...this.queryObj };
    const excludedFields = ['sort', 'fields', 'page', 'limit'];
    excludedFields.map((field) => delete queryParams[field]);

    let queryStr = JSON.stringify(queryParams);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.queryObj.sort) {
      const sortBy = this.queryObj.sort.split(',').join(' '); // Sorting by multiple criterias - simply passing req.query.sort into sort()
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    if (this.queryObj.fields) {
      const fields = this.queryObj.fields.split(',').join(' '); // create set of fields will be displayed in response
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v'); // field with prefix "-" will be hidden from the response
    }

    return this;
  }

  paginate() {
    const page = this.queryObj.page * 1 || 1;
    const limit = this.queryObj.limit * 1 || 50;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }

  // populating and filter properties
  reference(refProperties, filters) {
    let filterArr, refPath;

    refPath =
      typeof refProperties === 'string'
        ? refProperties
        : refProperties.join(' ');

    filterArr =
      typeof filters === 'string'
        ? '-' + filters
        : filters.reduce((acc, field) => acc + `-${field} `, '');

    this.query = this.query.populate({
      path: refPath, // properties to be referenced
      select: filterArr,
    });

    return this;
  }
}

module.exports = APIFeatures;
