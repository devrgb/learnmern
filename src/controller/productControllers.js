import { getDB } from "../config/db.js";

//Get Collection
const getCollection = () => getDB().collection("product");

//Create Product
export const createProduct = async (req, res) => {
  try {
    const { name, category, brand, ram, ssd, price, inStock } = req.body;

    if (!name || !category || !ram || !ssd) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required fields (name, category, ram, ssd, price)",
      });
    }

    const numericPrice = Number(price);

    if (
      price === undefined ||
      price === null ||
      price === "" ||
      !Number.isFinite(numericPrice)
    ) {
      return res.status(400).json({
        success: false,
        message: "Price must be a valid number",
      });
    }

    const newProduct = {
      name: String(name).trim(),
      category: String(category).trim(),
      brand: String(brand).trim(),
      ram: String(ram).trim(),
      ssd: String(ssd).trim(),
      price: numericPrice,
      inStock: inStock !== undefined ? Boolean(inStock) : true,
      brand: brand ? String(brand).trim() : "",
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
      data: productData,
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
    if (updateFields.price !== undefined) {
      updateFields.price = Number(updateFields.price);
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
