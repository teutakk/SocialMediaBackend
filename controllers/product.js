import User from "../models/User.js";
import Product from "../models/Product.js";
import { insertMultipleObjects } from "../aws/S3Client.js";

export const createProduct = async (req, res) => {
  try {
    const { userId, productType, description, price } = req.body;

    let images = [];

    if (req.files) {
      try {
        const keys = await insertMultipleObjects(req.files);
        images = keys;
      } catch (err) {
        console.error(err);
        throw err;
      }
    }

    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    const { firstName, lastName } = user;

    let image = [];

    for (let i = 0; i < images.length; i++) {
      const url =
        "https://objectone12.s3.eu-north-1.amazonaws.com/";
      const imageUrl = url + images[i];
      image.push(imageUrl);
    }

    const newProduct = new Product({
      userId: userId,
      author: firstName + " " + lastName,
      productImages: image,
      productType: productType,
      description: description,
      price: price,
    });

    await newProduct.save();
    return res.status(201).json(newProduct);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    return res.status(200).json(products);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getSingleProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.status(200).json(product);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    const { description, price } = req.body;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found!" });
    }

    if (description !== undefined) {
      product.description = description;
    }
    if (price !== undefined) {
      product.price = price;
    }

    product.updatedAt = new Date();

    await product.save();

    return res.status(200).json({ edited: true, product });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found!" });
    }

    await product.deleteOne();

    return res.status(200).json({ message: "Product deleted successfully!" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
