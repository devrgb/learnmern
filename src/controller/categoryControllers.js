import { getDB } from "../config/db.js";
import { ObjectId } from "mongodb";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";

//Get Collection
const getCollection = () => getDB().collection("category");

//Create Category
export const createCategory = asyncHandler(async (req, res) => {
  // 1. Allow only the "name" field
  const allowedFields = ["name"];

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

  // 2. Validate category name
  const { name } = req.body;

  if (typeof name !== "string" || !name.trim()) {
    throw new ApiError(400, "Please provide a valid Category Name");
  }

  // 3. Create category
  const newCategory = {
    name: name.trim(),
    createdAt: new Date(),
  };

  // 4. Save to MongoDB
  const result = await getCollection().insertOne(newCategory);

  // 5. Send response
  return res.status(201).json({
    success: true,
    data: {
      _id: result.insertedId,
      ...newCategory,
    },
  });
});

export const getCategory = asyncHandler(async (req, res) => {
  const categoryData = await getCollection().find().toArray();

  if (categoryData.length > 0) {
    const categoriesWithCount = await Promise.all(
      categoryData.map(async (category) => {
        const productCount = await getDB()
          .collection("product")
          .countDocuments({
            categoryId: category._id,
          });

        return {
          _id: category._id,
          name: category.name,
          productCount,
        };
      }),
    );

    return res.status(200).json({
      success: true,
      data: categoriesWithCount,
    });
  } else {
    return res.status(200).json({
      success: true,
      message: "No Category Found",
    });
  }
});

//Get Category By ID
export const getCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid MongoDB ObjectId format");
  }

  const category = await getCollection().findOne({
    _id: new ObjectId(id),
  });

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  res.status(200).json({ success: true, data: category });
});

//Update Category By ID
export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid MongoDB ObjectId format");
  }

  const { name } = req.body;

  if (typeof name !== "string" || !name.trim()) {
    throw new ApiError(400, "Please provide a valid Category Name");
  }

  const updateFields = {
    name: name.trim(),
    updatedAt: new Date(),
  };

  const result = await getCollection().updateOne(
    { _id: new ObjectId(id) },
    { $set: updateFields },
  );

  if (result.matchedCount === 0) {
    throw new ApiError(404, "Category not found");
  }

  const updatedCategory = await getCollection().findOne({
    _id: new ObjectId(id),
  });

  res.status(200).json({
    success: true,
    message: "Category updated successfully",
    data: updatedCategory,
  });
});

// Delete Category
export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid MongoDB ObjectId format");
  }

  const categoryObjectId = new ObjectId(id);

  // Step 1: Check whether products use this category
  const productCount = await getDB().collection("product").countDocuments({
    categoryId: categoryObjectId,
  });

  // Step 2: Stop deletion if products exist
  if (productCount > 0) {
    return res.status(400).json({
      success: false,
      message:
        "Cannot delete category. Products are already assigned to this category.",
      productCount,
    });
  }

  // Step 3: Delete category if no products exist
  const result = await getCollection().deleteOne({
    _id: categoryObjectId,
  });

  if (result.deletedCount === 0) {
    throw new ApiError(404, "Category not found");
  }

  return res.status(200).json({
    success: true,
    message: "Category deleted successfully",
  });
});
