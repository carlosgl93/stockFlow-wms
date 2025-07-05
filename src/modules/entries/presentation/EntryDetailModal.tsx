import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  VStack,
  HStack,
  Text,
  Divider,
  Badge,
  Spinner,
  Box,
} from "@chakra-ui/react";
import { IEntry } from "../types";
import { capitalize, useTranslate } from "utils";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { getProductById } from "modules/products/infrastructure";

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  entry: IEntry | null;
}

interface ProductWithDetails {
  id: string;
  name: string;
  unitsNumber: number;
  looseUnitsNumber: number;
  totalUnitsNumber: number;
  lotId: string;
  placeId: string;
  expirityDate: string;
  palletNumber: string;
  unitOfMeasure: string;
  qPerUnit: number;
  unitsPerBox: number;
}

export const EntryDetailModal = ({ isOpen, onClose, entry }: IProps) => {
  const { t } = useTranslate();
  const [productsWithDetails, setProductsWithDetails] = useState<
    ProductWithDetails[]
  >([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!entry?.productsToEnter || entry.productsToEnter.length === 0) {
        setProductsWithDetails([]);
        return;
      }

      setIsLoadingProducts(true);
      try {
        const productDetails = await Promise.all(
          entry.productsToEnter.map(async (productEntry) => {
            // Extract the base product ID (remove the lot suffix)
            const baseProductId = productEntry.id.split("-")[0];

            try {
              const productData = await getProductById(baseProductId);
              return {
                id: productEntry.id,
                name:
                  productData.name ||
                  productData.id ||
                  `${t("Product")} ${baseProductId}`,
                unitsNumber: productEntry.unitsNumber || 0,
                looseUnitsNumber: productEntry.looseUnitsNumber || 0,
                totalUnitsNumber: productEntry.totalUnitsNumber || 0,
                lotId: productEntry.lotId || "",
                placeId: productEntry.placeId || "",
                expirityDate: productEntry.expirityDate || "",
                palletNumber: productEntry.palletNumber || "",
                unitOfMeasure: productEntry.unitOfMeasure || "",
                qPerUnit: productEntry.qPerUnit || 0,
                unitsPerBox: productEntry.unitsPerBox || 0,
              };
            } catch (error) {
              console.error(`Error fetching product ${baseProductId}:`, error);
              return {
                id: productEntry.id,
                name: `${t("Product")} ${baseProductId}`,
                unitsNumber: productEntry.unitsNumber || 0,
                looseUnitsNumber: productEntry.looseUnitsNumber || 0,
                totalUnitsNumber: productEntry.totalUnitsNumber || 0,
                lotId: productEntry.lotId || "",
                placeId: productEntry.placeId || "",
                expirityDate: productEntry.expirityDate || "",
                palletNumber: productEntry.palletNumber || "",
                unitOfMeasure: productEntry.unitOfMeasure || "",
                qPerUnit: productEntry.qPerUnit || 0,
                unitsPerBox: productEntry.unitsPerBox || 0,
              };
            }
          })
        );
        setProductsWithDetails(productDetails);
      } catch (error) {
        console.error("Error fetching product details:", error);
        setProductsWithDetails([]);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    if (isOpen && entry) {
      fetchProductDetails();
    }
  }, [isOpen, entry]);

  if (!entry) return null;

  const totalUnitsInEntry = productsWithDetails.reduce((acc, product) => {
    return acc + product.totalUnitsNumber;
  }, 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t("Entry Details")}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between">
              <Text fontWeight="bold">{t("Document Number")}:</Text>
              <Text>{entry.docNumber}</Text>
            </HStack>
            <Divider />
            <HStack justify="space-between">
              <Text fontWeight="bold">{t("Entry Date")}:</Text>
              <Text>{entry.entryDate}</Text>
            </HStack>
            <Divider />
            <HStack justify="space-between">
              <Text fontWeight="bold">{t("Description")}:</Text>
              <Text>{entry.description}</Text>
            </HStack>
            {/* <Divider /> */}
            {/* <HStack justify="space-between">
              <Text fontWeight="bold">{t("Supplier")}:</Text>
              <Text>{entry.supplierId}</Text>
            </HStack>
            <Divider />
            <HStack justify="space-between">
              <Text fontWeight="bold">{t("Transporter")}:</Text>
              <Text>{entry.transporterId}</Text>
            </HStack> */}
            <Divider />
            <HStack justify="space-between">
              <Text fontWeight="bold">{t("Total Units in Entry")}:</Text>
              <Badge colorScheme="blue" fontSize="md" p={2}>
                {totalUnitsInEntry}
              </Badge>
            </HStack>

            {entry.productsToEnter && entry.productsToEnter.length > 0 && (
              <>
                <Divider />
                <Text fontWeight="bold" fontSize="lg">
                  {t("Products")}:
                </Text>
                {isLoadingProducts ? (
                  <Box display="flex" justifyContent="center" p={4}>
                    <Spinner size="md" />
                    <Text ml={2}>{t("Loading products...")}</Text>
                  </Box>
                ) : (
                  <VStack spacing={3} align="stretch">
                    {productsWithDetails.map((product, index) => (
                      <Box
                        key={index}
                        p={4}
                        bg="gray.50"
                        borderRadius="md"
                        border="1px solid"
                        borderColor="gray.200"
                      >
                        <VStack align="stretch" spacing={2}>
                          <HStack justify="space-between">
                            <Text
                              fontSize="md"
                              fontWeight="bold"
                              color="blue.600"
                            >
                              {product.name.toUpperCase()}
                            </Text>
                            <Badge colorScheme="green" size="sm">
                              {t("Lot")}: {product.lotId}
                            </Badge>
                          </HStack>

                          <HStack justify="space-between">
                            <VStack align="start" spacing={1}>
                              <Text fontSize="sm">
                                <Text as="span" fontWeight="medium">
                                  {t("Units")}:
                                </Text>{" "}
                                {product.unitsNumber}
                              </Text>
                              {/* {product.looseUnitsNumber !== undefined && (
                                <Text fontSize="sm">
                                  <Text as="span" fontWeight="medium">
                                    {t("Loose Units")}:
                                  </Text>{" "}
                                  {product.looseUnitsNumber}
                                </Text>
                              )} */}
                              {/* <Text fontSize="sm">
                                <Text as="span" fontWeight="medium">
                                  {t("Total Units")}:
                                </Text>{" "}
                                {product.totalUnitsNumber}
                              </Text> */}
                            </VStack>

                            <VStack align="end" spacing={1}>
                              <Text fontSize="sm">
                                <Text as="span" fontWeight="medium">
                                  {t("Unit of Measure")}:
                                </Text>{" "}
                                {t(product.unitOfMeasure)}
                              </Text>
                              <Text fontSize="sm">
                                <Text as="span" fontWeight="medium">
                                  {t("Quantity per Unit")}:
                                </Text>{" "}
                                {product.qPerUnit}
                              </Text>
                              <Text fontSize="sm">
                                <Text as="span" fontWeight="medium">
                                  {t("Units per Box")}:
                                </Text>{" "}
                                {product.unitsPerBox}
                              </Text>
                            </VStack>
                          </HStack>

                          <Divider />

                          <HStack justify="space-between">
                            <Text fontSize="sm">
                              <Text as="span" fontWeight="medium">
                                {t("Expiry Date")}:
                              </Text>{" "}
                              {dayjs(product.expirityDate).format("DD-MM-YYYY")}
                            </Text>
                            {product.palletNumber && (
                              <Text fontSize="sm">
                                <Text as="span" fontWeight="medium">
                                  {t("Pallet")}:
                                </Text>{" "}
                                {product.palletNumber}
                              </Text>
                            )}
                          </HStack>
                        </VStack>
                      </Box>
                    ))}
                  </VStack>
                )}
              </>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>{t("Close")}</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
