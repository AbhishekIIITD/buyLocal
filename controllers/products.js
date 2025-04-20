const { PrismaClient } = require("@prisma/client");
const { equal } = require("assert");
const prisma = new PrismaClient();

async function getAllProducts(request, response) {
  const mode = request.query.mode || "";
  // checking if we are on the admin products page because we don't want to have filtering, sorting and pagination there
  if (mode === "admin") {
    try {
      const adminProducts = await prisma.product.findMany({});
      return response.json(adminProducts);
    } catch (error) {
      return response.status(500).json({ error: "Error fetching products" });
    }
  } else {
    const dividerLocation = request.url.indexOf("?");
    let filterObj = {};
    let sortObj = {};
    let sortByValue = "defaultSort";

    // getting current page
    const page = Number(request.query.page) ? Number(request.query.page) : 1;

    if (dividerLocation !== -1) {
      const queryArray = request.url
        .substring(dividerLocation + 1, request.url.length)
        .split("&");

      let filterType;
      let filterArray = [];

      for (let i = 0; i < queryArray.length; i++) {
        // checking whether it is filter mode or price filter
        if (
          queryArray[i].indexOf("filters") !== -1 &&
          queryArray[i].indexOf("price") !== -1
        ) {
          // taking price par. Of course I could write it much simpler: filterType="price"
          filterType = queryArray[i].substring(
            queryArray[i].indexOf("price"),
            queryArray[i].indexOf("price") + "price".length
          );
        }

        // checking whether it is filter mode and rating filter
        if (
          queryArray[i].indexOf("filters") !== -1 &&
          queryArray[i].indexOf("rating") !== -1
        ) {
          // taking "rating" part. Of course I could write it much simpler: filterType="rating"
          filterType = queryArray[i].substring(
            queryArray[i].indexOf("rating"),
            queryArray[i].indexOf("rating") + "rating".length
          );
        }

        // checking whether it is filter mode and category filter
        if (
          queryArray[i].indexOf("filters") !== -1 &&
          queryArray[i].indexOf("category") !== -1
        ) {
          // getting "category" part
          filterType = "category";
        }
        // checking whether it is filter mode and manufacturer filter

        if (
          queryArray[i].indexOf("filters") !== -1 &&
          queryArray[i].indexOf("manufacturer") !== -1
        ) {
          filterType = "manufacturer";
        }

        if (
          queryArray[i].indexOf("filters") !== -1 &&
          queryArray[i].indexOf("inStock") !== -1
        ) {
          // getting "inStock" part.  Of course I could write it much simpler: filterType="inStock"
          filterType = queryArray[i].substring(
            queryArray[i].indexOf("inStock"),
            queryArray[i].indexOf("inStock") + "inStock".length
          );
        }

        if (
          queryArray[i].indexOf("filters") !== -1 &&
          queryArray[i].indexOf("outOfStock") !== -1
        ) {
          // getting "outOfStock" part.  Of course I could write it much simpler: filterType="outOfStock"
          filterType = queryArray[i].substring(
            queryArray[i].indexOf("outOfStock"),
            queryArray[i].indexOf("outOfStock") + "outOfStock".length
          );
        }

        if (queryArray[i].indexOf("sort") !== -1) {
          // getting sort value from the query
          sortByValue = queryArray[i].substring(queryArray[i].indexOf("=") + 1);
        }

        // checking whether in the given query filters mode is on
        if (queryArray[i].indexOf("filters") !== -1) {
          let filterValue;
          // checking that it is not filter by category. I am doing it so I can avoid converting string to number
          if (
            queryArray[i].indexOf("category") === -1 &&
            queryArray[i].indexOf("manufacturer") === -1
          ) {
            // taking value part. It is the part where number value of the query is located and I am converting it to the number type because it is string by default
            filterValue = parseInt(
              queryArray[i].substring(
                queryArray[i].indexOf("=") + 1,
                queryArray[i].length
              )
            );
          } else {
            // if it is filter by category
            filterValue = queryArray[i].substring(
              queryArray[i].indexOf("=") + 1,
              queryArray[i].length
            );
          }

          // getting operator for example: lte, gte, gt, lt....
          const filterOperator = queryArray[i].substring(
            queryArray[i].indexOf("$") + 1,
            queryArray[i].indexOf("=") - 1
          );

          // All of it I add to the filterArray
          // example for current state of filterArray:
          /*
                  [
                  { filterType: 'price', filterOperator: 'lte', filterValue: 3000 },
                  { filterType: 'rating', filterOperator: 'gte', filterValue: 0 }
                  ]
                  */
          filterArray.push({ filterType, filterOperator, filterValue });
        }
      }
      for (let item of filterArray) {
        filterObj = {
          ...filterObj,
          [item.filterType]: {
            [item.filterOperator]: item.filterValue,
          },
        };
      }
    }
    //console.log("Filter Object:", filterObj);

    let whereClause = { ...filterObj }; // Include other filters if any

    // Remove category filter from whereClause and use it separately
    if (filterObj.category && filterObj.category.equals) {
      delete whereClause.category; // Remove category filter from whereClause
    }
    if (filterObj.manufacturer && filterObj.manufacturer.equals) {
      delete whereClause.manufacturer; // Remove manufacturer filter from whereClause
    }

    if (sortByValue === "defaultSort") {
      sortObj = {};
    } else if (sortByValue === "titleAsc") {
      sortObj = {
        title: "asc",
      };
    } else if (sortByValue === "titleDesc") {
      sortObj = {
        title: "desc",
      };
    } else if (sortByValue === "lowPrice") {
      sortObj = {
        price: "asc",
      };
    } else if (sortByValue === "highPrice") {
      sortObj = {
        price: "desc",
      };
    }

    let products;

    //console.log(filterObj);

    if (Object.keys(filterObj).length === 0) {
      products = await prisma.product.findMany({
        // this is formula for pagination: (page - 1) * limit(take)
        skip: (page - 1) * 10,
        take: 12,
        include: {
          category: {
            select: {
              name: true,
            },
          },
        },
        orderBy: sortObj,
      });
    } else {
      // Check if category filter is present
      if (filterObj.category && filterObj.category.equals) {
        if (filterObj.manufacturer && filterObj.manufacturer.equals) {
          products = await prisma.product.findMany({
            skip: 0,
            take: 12,
            include: {
              category: {
                select: {
                  name: true,
                },
              },
            },
            where: {
              ...whereClause,
              category: {
                name: {
                  equals: filterObj.category.equals,
                },
              },
              manufacturer: {
                // Fix: Directly use `equals` if manufacturer is a string field
                equals: filterObj.manufacturer.equals,
              },
            },
            orderBy: {},
          });
        } else {
          products = await prisma.product.findMany({
            // this is formula for pagination: (page - 1) * limit(take)
            skip: (page - 1) * 10,
            take: 12,
            include: {
              category: {
                select: {
                  name: true,
                },
              },
            },
            where: {
              ...whereClause,
              category: {
                name: {
                  equals: filterObj.category.equals,
                },
              },
            },
            orderBy: sortObj,
          });
        }
      } else {
        // If no category filter, use whereClause
        products = await prisma.product.findMany({
          // this is formula for pagination: (page - 1) * limit(take)
          skip: (page - 1) * 10,
          take: 12,
          include: {
            category: {
              select: {
                name: true,
              },
            },
          },
          where: whereClause,
          orderBy: sortObj,
        });
      }
    }

    return response.json(products);
  }
}

async function getAllSpecialProducts(request, response) {
  // checking if we are on the admin products page because we don't want to have filtering, sorting and pagination there

  const dividerLocation = request.url.indexOf("?");
  let filterObj = {};
  let sortObj = {};
  let sortByValue = "defaultSort";

  // getting current page
  const page = Number(request.query.page) ? Number(request.query.page) : 1;

  if (dividerLocation !== -1) {
    const queryArray = request.url
      .substring(dividerLocation + 1, request.url.length)
      .split("&");

    let filterType;
    let filterArray = [];

    for (let i = 0; i < queryArray.length; i++) {
      // checking whether it is filter mode or price filter
      if (
        queryArray[i].indexOf("filters") !== -1 &&
        queryArray[i].indexOf("price") !== -1
      ) {
        // taking price par. Of course I could write it much simpler: filterType="price"
        filterType = queryArray[i].substring(
          queryArray[i].indexOf("price"),
          queryArray[i].indexOf("price") + "price".length
        );
      }

      // checking whether it is filter mode and rating filter
      if (
        queryArray[i].indexOf("filters") !== -1 &&
        queryArray[i].indexOf("rating") !== -1
      ) {
        // taking "rating" part. Of course I could write it much simpler: filterType="rating"
        filterType = queryArray[i].substring(
          queryArray[i].indexOf("rating"),
          queryArray[i].indexOf("rating") + "rating".length
        );
      }

      // checking whether it is filter mode and category filter
      if (
        queryArray[i].indexOf("filters") !== -1 &&
        queryArray[i].indexOf("category") !== -1
      ) {
        // getting "category" part
        filterType = "category";
      }

      if (
        queryArray[i].indexOf("filters") !== -1 &&
        queryArray[i].indexOf("inStock") !== -1
      ) {
        // getting "inStock" part.  Of course I could write it much simpler: filterType="inStock"
        filterType = queryArray[i].substring(
          queryArray[i].indexOf("inStock"),
          queryArray[i].indexOf("inStock") + "inStock".length
        );
      }

      if (
        queryArray[i].indexOf("filters") !== -1 &&
        queryArray[i].indexOf("outOfStock") !== -1
      ) {
        // getting "outOfStock" part.  Of course I could write it much simpler: filterType="outOfStock"
        filterType = queryArray[i].substring(
          queryArray[i].indexOf("outOfStock"),
          queryArray[i].indexOf("outOfStock") + "outOfStock".length
        );
      }

      if (queryArray[i].indexOf("sort") !== -1) {
        // getting sort value from the query
        sortByValue = queryArray[i].substring(queryArray[i].indexOf("=") + 1);
      }

      // checking whether in the given query filters mode is on
      if (queryArray[i].indexOf("filters") !== -1) {
        let filterValue;
        // checking that it is not filter by category. I am doing it so I can avoid converting string to number
        if (queryArray[i].indexOf("category") === -1) {
          // taking value part. It is the part where number value of the query is located and I am converting it to the number type because it is string by default
          filterValue = parseInt(
            queryArray[i].substring(
              queryArray[i].indexOf("=") + 1,
              queryArray[i].length
            )
          );
        } else {
          // if it is filter by category
          filterValue = queryArray[i].substring(
            queryArray[i].indexOf("=") + 1,
            queryArray[i].length
          );
        }

        // getting operator for example: lte, gte, gt, lt....
        const filterOperator = queryArray[i].substring(
          queryArray[i].indexOf("$") + 1,
          queryArray[i].indexOf("=") - 1
        );

        // All of it I add to the filterArray
        // example for current state of filterArray:
        /*
                  [
                  { filterType: 'price', filterOperator: 'lte', filterValue: 3000 },
                  { filterType: 'rating', filterOperator: 'gte', filterValue: 0 }
                  ]
                  */
        filterArray.push({ filterType, filterOperator, filterValue });
      }
    }
    for (let item of filterArray) {
      filterObj = {
        ...filterObj,
        [item.filterType]: {
          [item.filterOperator]: item.filterValue,
        },
      };
    }
  }

  let whereClause = { ...filterObj }; // Include other filters if any

  // Remove category filter from whereClause and use it separately
  if (filterObj.category && filterObj.category.equals) {
    delete whereClause.category; // Remove category filter from whereClause
  }

  if (sortByValue === "defaultSort") {
    sortObj = {};
  } else if (sortByValue === "titleAsc") {
    sortObj = {
      title: "asc",
    };
  } else if (sortByValue === "titleDesc") {
    sortObj = {
      title: "desc",
    };
  } else if (sortByValue === "lowPrice") {
    sortObj = {
      price: "asc",
    };
  } else if (sortByValue === "highPrice") {
    sortObj = {
      price: "desc",
    };
  }

  let products;

  if (Object.keys(filterObj).length === 0) {
    products = await prisma.product.findMany({
      // this is formula for pagination: (page - 1) * limit(take)
      skip: (page - 1) * 10,
      take: 12,
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: sortObj,
    });
  } else {
    // Check if category filter is present
    if (filterObj.category && filterObj.category.equals) {
      products = await prisma.product.findMany({
        // this is formula for pagination: (page - 1) * limit(take)
        skip: (page - 1) * 10,
        take: 12,
        include: {
          category: {
            select: {
              name: true,
            },
          },
        },
        where: {
          ...whereClause,
          category: {
            name: {
              equals: filterObj.category.equals,
            },
          },
        },
        orderBy: sortObj,
      });
    } else {
      // If no category filter, use whereClause
      products = await prisma.product.findMany({
        // this is formula for pagination: (page - 1) * limit(take)
        skip: (page - 1) * 10,
        take: 12,
        include: {
          category: {
            select: {
              name: true,
            },
          },
        },
        where: whereClause,
        orderBy: sortObj,
      });
    }
  }

  return response.json(products);
}

// async function getAllProductsOld(request, response) {
//   try {
//     const products = await prisma.product.findMany({
//       include: {
//         category: {
//           select: {
//             name: true,
//           },
//         },
//       },
//     });
//     response.status(200).json(products);
//   } catch (error) {
//     console.log(error);
//   }
// }

async function createProduct(request, response) {
  try {
    const {
      slug,
      title,
      mainImage,
      price,
      description,
      manufacturer,
      categoryId,
      inStock,
    } = request.body;

    // Fetch the maximum ID from the products table
    const maxProduct = await prisma.product.findFirst({
      orderBy: {
        id: "desc", // Get the highest ID
      },
      select: {
        id: true,
      },
    });

    const newProductId = maxProduct ? maxProduct.id + 1 : 1; // If no products exist, start with ID = 1

    // Create the product with the new ID
    const product = await prisma.product.create({
      data: {
        id: newProductId,
        slug,
        title,
        mainImage,
        price,
        rating: 5,
        description,
        manufacturer,
        categoryId,
        inStock,
      },
    });

    return response.status(201).json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    return response.status(500).json({ error: "Error creating product" });
  }
}

// Method for updating existing product
async function updateProduct(request, response) {
  try {
    const { id } = request.params; // Getting a slug from params
    const {
      slug,
      title,
      mainImage,
      price,
      rating,
      description,
      manufacturer,
      categoryId,
      inStock,
    } = request.body;
    // Finding a product by slug
    const existingProduct = await prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!existingProduct) {
      return response.status(404).json({ error: "Product not found" });
    }

    // Updating found product
    const updatedProduct = await prisma.product.update({
      where: {
        id, // Using id of the found product
      },
      data: {
        title: title,
        mainImage: mainImage,
        slug: slug,
        price: price,
        rating: rating,
        description: description,
        manufacturer: manufacturer,
        categoryId: categoryId,
        inStock: inStock,
      },
    });

    return response.status(200).json(updatedProduct);
  } catch (error) {
    return response.status(500).json({ error: "Error updating product" });
  }
}

// Method for deleting a product
async function deleteProduct(request, response) {
  try {
    const { id } = request.params;

    // Check for related records in wishlist table
    const relatedOrderProductItems =
      await prisma.customer_order_product.findMany({
        where: {
          productId: id,
        },
      });
    if (relatedOrderProductItems.length > 0) {
      return response.status(400).json({
        error: "Cannot delete product because of foreign key constraint. ",
      });
    }

    await prisma.product.delete({
      where: {
        id,
      },
    });
    return response.status(204).send();
  } catch (error) {
    console.log(error);
    return response.status(500).json({ error: "Error deleting product" });
  }
}

async function searchProducts(request, response) {
  try {
    const { query, category, manufacturer, page = 1, limit = 10 } = request.query;
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    if (!query && !category) {
      return response.status(400).json({
        error: "Either query or category parameter is required",
      });
    }

    let categoryFilter = {};
    let manufacturerFilter = {};

    if (
      (category && category.toLowerCase() === "primary-storage") ||
      category.toLowerCase() === "secondary-storage"
    ) {
      const storageCategories = await prisma.category.findMany({
        where: {
          name: { in: ["HDDs", "SDDs"] },
        },
        select: { id: true },
      });

      if (storageCategories.length > 0) {
        const categoryIds = storageCategories.map((c) => c.id);
        categoryFilter = { categoryId: { in: categoryIds } };
      }
    } else if (category) {
      const categories = await prisma.category.findMany({
        where: {
          name: { contains: category },
        },
        select: { id: true },
      });

      if (categories.length > 0) {
        const categoryIds = categories.map((c) => c.id);
        categoryFilter = { categoryId: { in: categoryIds } };
      }
    } else {
      const defaultCategory = await prisma.category.findFirst({
        where: { name: "Display" },
        select: { id: true },
      });

      if (defaultCategory) {
        categoryFilter = { categoryId: defaultCategory.id };
      }
    }

    // Add manufacturer filter only if both manufacturer and category are present
    if (manufacturer && category) {
      manufacturerFilter = {
        manufacturer: { contains: manufacturer },
      };
    }

    const combinedFilter = {
      AND: [
        categoryFilter,
        manufacturerFilter,
        query
          ? {
              OR: [
                { title: { contains: query } },
                { description: { contains: query} },
              ],
            }
          : {},
      ],
    };

    const totalProducts = await prisma.product.count({
      where: combinedFilter,
    });

    const products = await prisma.product.findMany({
      where: combinedFilter,
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
    });

    return response.json({
      products,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalProducts / pageSize),
      totalProducts,
    });
  } catch (error) {
    console.error("Error searching products:", error);
    return response.status(500).json({ error: "Error searching products" });
  }
}

async function getProductById(request, response) {
  const { id } = request.params;
  const product = await prisma.product.findUnique({
    where: {
      id: id,
    },
    include: {
      category: true,
    },
  });
  if (!product) {
    return response.status(404).json({ error: "Product not found" });
  }
  return response.status(200).json(product);
}

async function getManufacturers(req, res) {
  try {
    const { categoryName } = req.query;

    if (!categoryName) {
      return res.status(400).json({ error: "Category name is required" });
    }

    // Fetch category by name
    const category = await prisma.category.findFirst({
      where: { name: { contains: categoryName } },
      include: {
        product: {
          select: { manufacturer: true },
        },
      },
    });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Extract unique manufacturers
    const manufacturers = [
      ...new Set(category.product.map((p) => p.manufacturer)),
    ];

    return res.status(200).json({ manufacturers });
  } catch (error) {
    console.error("Error fetching manufacturers:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductById,
  getManufacturers,
};
