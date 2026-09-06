import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.radarTransaction.deleteMany();
  await prisma.reservedPlanItem.deleteMany();
  await prisma.reservedPlan.deleteMany();
  await prisma.transactionItem.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.product.deleteMany();
  await prisma.connectedBusiness.deleteMany();
  await prisma.merchant.deleteMany();

  const merchant = await prisma.merchant.create({
    data: {
      businessName: "Kape Kubo Mini Mart",
      ownerName: "Maya Santos",
      personalFunds: 3200,
      businessFunds: 5000,
      reservedBusinessFunds: 1200,
      glockEnabled: true,
      products: {
        create: [
            { name: "Chicken Fillet", category: "Food", subcategory: "Chicken", stock: 7, sellingPrice: 75, costPrice: 50, planningMethod: "FORECAST_AI", lowStockThreshold: 10 },
            { name: "Bottled Water", category: "Drinks", subcategory: "Water", stock: 30, sellingPrice: 20, costPrice: 12, planningMethod: "VMI", lowStockThreshold: 10 },
            { name: "Iced Coffee", category: "Drinks", subcategory: "Coffee", stock: 18, sellingPrice: 55, costPrice: 28, planningMethod: "FORECAST_AI", lowStockThreshold: 8 },
            { name: "Frozen Siomai", category: "Frozen Goods", subcategory: "Ready-to-cook", stock: 5, sellingPrice: 120, costPrice: 82, planningMethod: "VMI", lowStockThreshold: 8 },
            { name: "Rice 5kg", category: "Grocery", subcategory: "Staples", stock: 12, sellingPrice: 285, costPrice: 248, planningMethod: "FORECAST_AI", lowStockThreshold: 5 },
            { name: "Banana Cue", category: "Food", subcategory: "Street Food", stock: 24, sellingPrice: 35, costPrice: 18, planningMethod: "FORECAST_AI", lowStockThreshold: 12 },
        ],
      },
    },
    include: { products: true },
  });

  const vendors = await Promise.all([
    prisma.merchant.create({
      data: {
        businessName: "Kuya Mark Frozen Goods",
        ownerName: "Mark Villanueva",
        personalFunds: 0,
        businessFunds: 0,
        glockEnabled: true,
        products: {
          create: [
            { name: "Frozen Siomai", category: "Frozen Goods", subcategory: "Ready-to-cook", stock: 120, sellingPrice: 110, costPrice: 78, planningMethod: "VMI", lowStockThreshold: 20, isVisibleToConnectedBusinesses: true, vendorAvailableQuantity: 80, vendorPrice: 78 },
            { name: "Chicken Fillet", category: "Food", subcategory: "Chicken", stock: 60, sellingPrice: 72, costPrice: 48, planningMethod: "VMI", lowStockThreshold: 10, isVisibleToConnectedBusinesses: true, vendorAvailableQuantity: 35, vendorPrice: 48 },
          ],
        },
      },
    }),
    prisma.merchant.create({
      data: {
        businessName: "Southside Beverage Supplier",
        ownerName: "Nico Reyes",
        personalFunds: 0,
        businessFunds: 0,
        glockEnabled: true,
        products: {
          create: [
            { name: "Bottled Water", category: "Drinks", subcategory: "Water", stock: 300, sellingPrice: 18, costPrice: 10, planningMethod: "VMI", lowStockThreshold: 40, isVisibleToConnectedBusinesses: true, vendorAvailableQuantity: 200, vendorPrice: 10 },
            { name: "Iced Coffee", category: "Drinks", subcategory: "Coffee", stock: 100, sellingPrice: 48, costPrice: 25, planningMethod: "VMI", lowStockThreshold: 20, isVisibleToConnectedBusinesses: true, vendorAvailableQuantity: 50, vendorPrice: 25 },
          ],
        },
      },
    }),
    prisma.merchant.create({
      data: {
        businessName: "MiniMart Pasig",
        ownerName: "Aira Lim",
        personalFunds: 0,
        businessFunds: 0,
        glockEnabled: true,
        products: {
          create: [
            { name: "Rice 5kg", category: "Grocery", subcategory: "Staples", stock: 80, sellingPrice: 275, costPrice: 240, planningMethod: "VMI", lowStockThreshold: 10, isVisibleToConnectedBusinesses: true, vendorAvailableQuantity: 30, vendorPrice: 240 },
          ],
        },
      },
    }),
  ]);

  await prisma.connectedBusiness.createMany({ data: vendors.map((vendor, index) => ({ merchantId: merchant.id, connectedMerchantId: vendor.id, status: "APPROVED", relationshipType: index === 1 ? "SUPPLIER" : "BOTH" })) });

  const products = await prisma.product.findMany({ where: { merchantId: merchant.id } });
  await prisma.transaction.create({ data: { merchantId: merchant.id, totalAmount: 275, paymentStatus: "PAID", receiptCode: "GLK-2408-018", paidAt: new Date(Date.now() - 2 * 60 * 60 * 1000), items: { create: [{ productId: products[0].id, productName: products[0].name, quantity: 2, unitPrice: products[0].sellingPrice, subtotal: 150 }, { productId: products[1].id, productName: products[1].name, quantity: 1, unitPrice: products[1].sellingPrice, subtotal: 20 }, { productId: products[2].id, productName: products[2].name, quantity: 1, unitPrice: products[2].sellingPrice, subtotal: 55 }] } } });
  await prisma.transaction.create({ data: { merchantId: merchant.id, totalAmount: 120, paymentStatus: "PAID", receiptCode: "GLK-2408-017", paidAt: new Date(Date.now() - 5 * 60 * 60 * 1000), items: { create: [{ productId: products[3].id, productName: products[3].name, quantity: 1, unitPrice: products[3].sellingPrice, subtotal: 120 }] } } });

  const radarRows = [
    ["Makati", "Chicken Fillet", "Food", 8, 16, "Food stall"], ["Makati", "Chicken Fillet", "Food", 12, 17, "Mini grocery"], ["Makati", "Iced Coffee", "Drinks", 14, 16, "Cafe kiosk"], ["Makati", "Iced Coffee", "Drinks", 10, 18, "Food stall"], ["Makati", "Bottled Water", "Drinks", 20, 12, "Sari-sari store"], ["Makati", "Frozen Siomai", "Frozen Goods", 7, 15, "Mini grocery"],
  ] as const;
  await prisma.radarTransaction.createMany({ data: radarRows.map(([area, productName, category, quantity, hour, anonymizedMerchantType], index) => ({ area, productName, category, quantity, purchaseTime: new Date(Date.now() - (index + 1) * 86400000 + hour * 3600000), anonymizedMerchantType })) });
}

main().catch((error) => { console.error(error); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
