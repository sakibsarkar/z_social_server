import { FilterQuery, Query, Types } from "mongoose";

class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public query: Record<string, unknown>;

  constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>) {
    this.modelQuery = modelQuery;
    this.query = query;
    console.log("Initial query:", this.query);
  }

  search(searchableFields: string[]) {
    const searchTerm = this.query.searchTerm as string;
    if (searchTerm) {
      this.modelQuery = this.modelQuery.find({
        $or: searchableFields.map(
          (field) =>
            ({
              [field]: { $regex: searchTerm, $options: "i" },
            } as FilterQuery<T>)
        ),
      });
    }
    return this;
  }

  filter() {
    const queryObj = { ...this.query };

    const excludeFields = [
      "searchTerm",
      "sort",
      "limit",
      "page",
      "fields",
      "minPrice",
      "maxPrice",
    ];
    excludeFields.forEach((el) => delete queryObj[el]);

    if (queryObj.category) {
      queryObj.category = new Types.ObjectId(queryObj.category as string);
    }

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.modelQuery = this.modelQuery.find(JSON.parse(queryStr));
    console.log("Query after general filtering:", queryStr);

    // Price filtering
    if (this.query.minPrice || this.query.maxPrice) {
      const priceFilter: Record<string, unknown> = {};
      if (this.query.minPrice) {
        priceFilter.$gte = Number(this.query.minPrice);
      }
      if (this.query.maxPrice) {
        priceFilter.$lte = Number(this.query.maxPrice);
      }
      this.modelQuery = this.modelQuery.find({
        price: priceFilter,
      });
    }

    return this;
  }

  sort() {
    let sortBy = "-createdAt";
    if (this.query.sort) {
      switch (this.query.sort) {
        case "price-asc":
          sortBy = "discountPrice";
          break;
        case "price-desc":
          sortBy = "-discountPrice";
          break;
        case "rating":
          sortBy = "-rating";
          break;
        default:
          sortBy = this.query.sort as string;
      }
    }
    this.modelQuery = this.modelQuery.sort(sortBy);
    return this;
  }

  paginate() {
    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 10;
    const skip = (page - 1) * limit;

    this.modelQuery = this.modelQuery.skip(skip).limit(limit);
    return this;
  }

  fields() {
    const fields =
      (this.query.fields as string)?.split(",")?.join(" ") || "-__v";
    this.modelQuery = this.modelQuery.select(fields);
    return this;
  }
}

export default QueryBuilder;

// case "price-asc":
//   sortBy = "discountPrice";
//   break;
// case "price-desc":
//   sortBy = "-discountPrice";
