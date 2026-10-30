import { getDB } from "../config/db.js";
import { ObjectId } from "mongodb";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";

//Get Collection
const getCollection = () => getDB().collection("product");

//Create Product
export const createProduct = asyncHandler(async (req, res) => {
  // 1. Allow only these fields
  const allowedFields = [
    "name",
    "categoryId",
    "brand",
    "ram",
    "ssd",
    "price",
    "inStock",
  ];

  const unexpectedFields = Object.keys(req.body).filter(
    (key) => !allowedFields.includes(key),
  );

  if (unexpectedFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Unexpected fields are not allowed",
      fields: unexpectedFields,
    });
  }

  const { name, categoryId, brand, ram, ssd, price, inStock } = req.body;

  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof categoryId !== "string" ||
    !categoryId.trim() ||
    typeof ram !== "string" ||
    !ram.trim() ||
    typeof ssd !== "string" ||
    !ssd.trim()
  ) {
    throw new ApiError(
      400,
      "Please provide valid name, category, ram, and ssd",
    );
  }

  if (!ObjectId.isValid(categoryId)) {
    throw new ApiError(400, "Invalid category ID");
  }

  const categoryObjectId = new ObjectId(categoryId);

  // 4. Check whether the category exists
  const categoryExists = await getDB()
    .collection("category")
    .findOne({ _id: categoryObjectId });

  if (!categoryExists) {
    throw new ApiError(
      404,
      "Category not found. Please provide an existing category ID",
    );
  }

  if (
    price === undefined ||
    price === null ||
    (typeof price === "string" && !price.trim())
  ) {
    throw new ApiError(400, "Price is required");
  }
  const numericPrice = Number(price);

  if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
    throw new ApiError(400, "Price must be a valid number greater than zero");
  }
  if (brand !== undefined && typeof brand !== "string") {
    throw new ApiError(400, "Brand must be a string");
  }

  if (inStock !== undefined && typeof inStock !== "boolean") {
    throw new ApiError(400, "inStock must be true or false");
  }

  const newProduct = {
    name: String(name).trim(),
    categoryId: categoryObjectId,
    brand: brand?.trim() ?? "",
    ram: String(ram).trim(),
    ssd: String(ssd).trim(),
    price: numericPrice,
    inStock: inStock ?? true,
    createdAt: new Date(),
  };

  const result = await getCollection().insertOne(newProduct);

  res.status(201).json({
    success: true,
    data: {
      _id: result.insertedId,
      ...newProduct,
    },
  });
});

// Get All Products
export const getProduct = asyncHandler(async (req, res) => {
  const productData = await getCollection().find().toArray();

  if (productData.length > 0) {
    return res.status(200).json({
      success: true,
      data: productData,
    });
  } else {
    throw new ApiError(200, "No Product Found");
  }
});

//Get Product By ID
export const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid MongoDB ObjectId format");
  }

  const product = await getCollection().findOne({
    _id: new ObjectId(id),
  });

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  res.status(200).json({ success: true, data: product });
});

//Update Product By ID
export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid MongoDB ObjectId format");
  }

  const updateFields = {
    ...req.body,
    updatedAt: new Date(),
  };

  // If price is passed, ensure it is stored as a number
  if (
    updateFields.price !== undefined &&
    (updateFields.price === "" || updateFields.price === null)
  ) {
    throw new ApiError(400, "Price cannot be empty")
  }

  if (updateFields.price !== undefined) {
    const numericPrice = Number(updateFields.price);

    if (!Number.isFinite(numericPrice)) {
      throw new ApiError(400, "Price must be a valid number")
    }

    if (numericPrice <= 0) {
      throw new ApiError(400, "Price must be greater than zero");
    }
    updateFields.price = numericPrice;
  }

  const result = await getCollection().updateOne(
    { _id: new ObjectId(id) },
    { $set: updateFields },
  );

  if (result.matchedCount === 0) {
    throw new ApiError(404, "Product not found")
  }

  const updatedProduct = await getCollection().findOne({
    _id: new ObjectId(id),
  });

  res.status(200).json({
    success: true,
    message: "Product updated successfully",
    data: updatedProduct,
  });
});

// Delete Product
export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid MongoDB ObjectId format")
  }

  const result = await getCollection().deleteOne({ _id: new ObjectId(id) });

  if (result.deletedCount === 0) {
    throw new ApiError(404, "Product not found")
  }

  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
});
