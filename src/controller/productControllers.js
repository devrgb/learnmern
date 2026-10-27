import { getDB } from "../config/db.js";
import { ObjectId } from "mongodb";

//Get Collection
const getCollection = () => getDB().collection("product");

//Create Product
export const createProduct = async (req, res) => {
  try {
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
      return res.status(400).json({
        success: false,
        message: "Please provide valid name, category, ram, and ssd",
      });
    }

    if (!ObjectId.isValid(categoryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const categoryObjectId = new ObjectId(categoryId);

    // 4. Check whether the category exists
    const categoryExists = await getDB()
      .collection("category")
      .findOne({ _id: categoryObjectId });

    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Category not found. Please provide an existing category ID",
      });
    }

    if (
      price === undefined ||
      price === null ||
      (typeof price === "string" && !price.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Price is required",
      });
    }
    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a valid number greater than zero",
      });
    }
    if (brand !== undefined && typeof brand !== "string") {
      return res.status(400).json({
        success: false,
        message: "Brand must be a string",
      });
    }

    if (inStock !== undefined && typeof inStock !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "inStock must be true or false",
      });
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
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//Get All product
export const getProduct = async (req, res) => {
  const productData = await getCollection().find().toArray();
  if (productData.length > 0) {
    res.status(200).json({
      success: true,
      data: productData,
    });
  } else {
    res.status(200).json({
      success: true,
      message: "No Product Found",
    });
  }
};

//Get Product By ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid MongoDB ObjectId format",
      });
    }

    const product = await getCollection().findOne({
      _id: new ObjectId(id),
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//Update Product By ID
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid MongoDB ObjectId format",
      });
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
      return res.status(400).json({
        success: false,
        message: "Price cannot be empty",
      });
    }

    if (updateFields.price !== undefined) {
      const numericPrice = Number(updateFields.price);

      if (!Number.isFinite(numericPrice)) {
        return res.status(400).json({
          success: false,
          message: "Price must be a valid number",
        });
      }

      if (numericPrice <= 0) {
        return res.status(400).json({
          success: false,
          message: "Price must be greater than zero",
        });
      }
      updateFields.price = numericPrice;
    }

    const result = await getCollection().updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields },
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const updatedProduct = await getCollection().findOne({
      _id: new ObjectId(id),
    });

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid MongoDB ObjectId format",
      });
    }

    const result = await getCollection().deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
