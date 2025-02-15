import {
  chakra,
  Box,
  Button,
  HStack,
  Text,
  VStack,
  SimpleGrid,
  GridItem,
  Divider,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
import { useSecondaryTextColor } from "theme";

import { moneyVO, useTranslate } from "utils";

import { PageHeader } from "shared/Layout";

import { IProduct } from "../types";
import { useCategoryLabel } from "./useCategoryLabel";

interface IProps {
  product: IProduct;
  onBack: () => void;
}

const ProductDetails = ({ product, onBack }: IProps) => {
  const categoryLabel = useCategoryLabel(product.category);
  const secondaryColor = useSecondaryTextColor();
  const { t } = useTranslate();

  return (
    <SimpleGrid
      w="100%"
      maxW="1000px"
      columns={{ base: 1, lg: 2 }}
      gap={{ base: 6, md: 8 }}
    >
      <GridItem colSpan={1}>
        <Box overflow="hidden" rounded="xl">
          <Box
            h={{ base: 64, md: "lg" }}
            w="100%"
            bgSize="cover"
            bgPos="center"
          />
        </Box>
      </GridItem>
      <GridItem colSpan={1}>
        <VStack spacing={{ base: 1, lg: 3 }} w="100%" align="start">
          <PageHeader
            title={product.name}
            description={t("A part of our {category} collection.", {
              category: (
                <chakra.span fontStyle="italic">{categoryLabel}</chakra.span>
              ),
            })}
          />
          <HStack w="100%" height="24px" spacing={4}>
            <Text fontWeight="semibold" fontSize={{ base: "lg", md: "xl" }}>
              {moneyVO.format(product.price)}
            </Text>
            <Divider orientation="vertical" />
          </HStack>

          <VStack w="100%">
            <Button w="100%" variant="outline" onClick={onBack}>
              {t("Back to products' list")}
            </Button>
          </VStack>
          <Accordion w="100%" pt={4} defaultIndex={[0]}>
            <AccordionItem>
              <AccordionButton>
                <Box as="span" flex="1" textAlign="left">
                  {t("Product Details")}
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4}>
                <Text>
                  {t("External Code")}: {product.extCode}
                </Text>
                <Text>
                  {t("Internal Code")}: {product.internalCode}
                </Text>
                <Text>
                  {t("Risk Category")}: {product.riskCategory}
                </Text>
                <Text>
                  {t("Selection Type")}: {product.selectionType}
                </Text>
              </AccordionPanel>
            </AccordionItem>
            {product.boxDetails && (
              <AccordionItem>
                <AccordionButton>
                  <Box as="span" flex="1" textAlign="left">
                    {t("Box Details")}
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <Text>
                    {t("Units")}: {product.boxDetails.units}
                  </Text>
                  <Text>
                    {t("Quantity")}: {product.boxDetails.quantity}
                  </Text>
                  <Text>
                    {t("Unit of Measure")}: {product.boxDetails.unitOfMeasure}
                  </Text>
                  <Text>
                    {t("Container")}: {product.boxDetails.container}
                  </Text>
                  <Text>
                    {t("Type")}: {product.boxDetails.type}
                  </Text>
                  <Text>
                    {t("Kilos")}: {product.boxDetails.kilos}
                  </Text>
                  <Text>
                    {t("Height")}: {product.boxDetails.height}
                  </Text>
                  <Text>
                    {t("Width")}: {product.boxDetails.width}
                  </Text>
                  <Text>
                    {t("Depth")}: {product.boxDetails.depth}
                  </Text>
                  <Text>
                    {t("Units per Surface")}:{" "}
                    {product.boxDetails.unitsPerSurface}
                  </Text>
                  <Text>
                    {t("Pallet Type")}: {product.boxDetails.palletType}
                  </Text>
                </AccordionPanel>
              </AccordionItem>
            )}
            <AccordionItem>
              <AccordionButton>
                <Box as="span" flex="1" textAlign="left">
                  {t("Shipping Information")}
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4}>
                <Text>{t("Shipping details will be provided here.")}</Text>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </VStack>
      </GridItem>
    </SimpleGrid>
  );
};

export { ProductDetails };
