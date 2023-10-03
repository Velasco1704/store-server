export const useUpdateProductStock = (
  productsStock: { id: string; stock: number }[],
  amountProducts: { productId: string; amount: number }[]
) =>
  productsStock
    .map((productStock) => {
      const order = amountProducts.find(
        (order) => order.productId === productStock.id
      );
      if (order && productStock.stock >= order.amount) {
        return {
          id: productStock.id,
          newStock: productStock.stock - order.amount,
        };
      } else {
        return null;
      }
    })
    .filter((result) => result !== null);
