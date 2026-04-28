import { Box, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { IProduct } from "../../types/pages";
import Product from "./Product";

type ProductsProps = {
  products?: IProduct[] | null;
};

export default function Products({ products }: ProductsProps) {
  const items = Array.isArray(products)
    ? products.filter((item) => item?.id && item?.title?.trim())
    : [];

  if (!items.length) return null;

  return (
    <VStack
      align="stretch"
      spacing="5"
      px={{ base: "4", md: "8" }}
      py={{ base: "8", md: "10" }}
    >
      {/* <Box>
        <Text
          as="h2"
          color="#4f1012"
          fontSize={{ base: "2xl", md: "4xl" }}
          fontWeight="800"
          lineHeight="1.08"
          letterSpacing="-0.02em"
        >
          Продукты
        </Text>
        <Text color="rgba(58,37,37,0.78)" fontSize={{ base: "md", md: "lg" }} mt="2">
          Несколько направлений, которые можно открыть прямо с главной страницы.
        </Text>
      </Box> */}

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing="5">
        {items.map((product) => (
          <Product key={product.id} product={product} />
        ))}
      </SimpleGrid>
    </VStack>
  );
}
