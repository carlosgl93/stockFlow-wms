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
import { IDispatch } from "../types";
import { useTranslate } from "utils";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { getProductById } from "modules/products/infrastructure";
import { getSupplierById } from "modules/suppliers";
import { getTransporterById } from "modules/transporters/infrastructure";

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  dispatch: IDispatch | null;
}

interface ProductWithDetails {
  id: string;
  name: string;
  lotId: string;
  unitsNumber: number;
  looseUnitsNumber: number;
  totalUnitsNumber: number;
  palletNumber: string;
}

interface DispatchWithDetails extends IDispatch {
  productsWithDetails?: ProductWithDetails[];
  supplierName?: string;
  transporterName?: string;
}

export const DispatchDetailModal = ({ isOpen, onClose, dispatch }: IProps) => {
  const { t } = useTranslate();
  const [dispatchWithDetails, setDispatchWithDetails] =
    useState<DispatchWithDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    const fetchDispatchDetails = async () => {
      if (!dispatch) {
        setDispatchWithDetails(null);
        return;
      }

      setIsLoadingDetails(true);
      try {
        // Fetch supplier and transporter details
        const [supplierData, transporterData] = await Promise.all([
          dispatch.supplierId
            ? getSupplierById(dispatch.supplierId).catch((error) => {
                console.error(
                  `Error fetching supplier ${dispatch.supplierId}:`,
                  error
                );
                return { company: `${t("Supplier")} ${dispatch.supplierId}` };
              })
            : Promise.resolve({ company: t("Unknown Supplier") }),
          dispatch.transporterId
            ? getTransporterById(dispatch.transporterId).catch((error) => {
                console.error(
                  `Error fetching transporter ${dispatch.transporterId}:`,
                  error
                );
                return {
                  name: `${t("Transporter")} ${dispatch.transporterId}`,
                };
              })
            : Promise.resolve({ name: t("Unknown Transporter") }),
        ]);

        // Fetch product details for each product in the dispatch
        const productsWithDetails: ProductWithDetails[] = [];

        if (dispatch.products && dispatch.products.length > 0) {
          for (const product of dispatch.products) {
            try {
              const productData = await getProductById(product.id);
              productsWithDetails.push({
                id: product.id,
                name: productData?.name || `${t("Product")} ${product.id}`,
                lotId: product.lotId || "",
                unitsNumber: product.unitsNumber || 0,
                looseUnitsNumber: product.looseUnitsNumber || 0,
                totalUnitsNumber: product.totalUnitsNumber || 0,
                palletNumber: product.palletNumber || "",
              });
            } catch (error) {
              console.error(`Error fetching product ${product.id}:`, error);
              productsWithDetails.push({
                id: product.id,
                name: `${t("Product")} ${product.id}`,
                lotId: product.lotId || "",
                unitsNumber: product.unitsNumber || 0,
                looseUnitsNumber: product.looseUnitsNumber || 0,
                totalUnitsNumber: product.totalUnitsNumber || 0,
                palletNumber: product.palletNumber || "",
              });
            }
          }
        }

        setDispatchWithDetails({
          ...dispatch,
          productsWithDetails,
          supplierName:
            supplierData?.company || `${t("Supplier")} ${dispatch.supplierId}`,
          transporterName:
            transporterData?.name ||
            `${t("Transporter")} ${dispatch.transporterId}`,
        });
      } catch (error) {
        console.error("Error fetching dispatch details:", error);
        setDispatchWithDetails({
          ...dispatch,
          productsWithDetails: [],
        });
      } finally {
        setIsLoadingDetails(false);
      }
    };

    if (isOpen && dispatch) {
      fetchDispatchDetails();
    }
  }, [isOpen, dispatch]);

  if (!dispatch) return null;

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pendiente":
      case "pending":
        return "yellow";
      case "despachado":
      case "dispatched":
        return "green";
      case "cancelado":
      case "cancelled":
        return "red";
      default:
        return "gray";
    }
  };

  const totalUnitsInDispatch =
    dispatchWithDetails?.productsWithDetails?.reduce((acc, product) => {
      return acc + product.totalUnitsNumber;
    }, 0) || 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t("Dispatch Details")}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {isLoadingDetails ? (
            <Box display="flex" justifyContent="center" p={8}>
              <Spinner size="lg" />
              <Text ml={4}>{t("Loading dispatch details...")}</Text>
            </Box>
          ) : (
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <Text fontWeight="bold">{t("Document Number")}:</Text>
                <Text>{dispatch.docNumber}</Text>
              </HStack>
              <Divider />

              <HStack justify="space-between">
                <Text fontWeight="bold">{t("Dispatch Date")}:</Text>
                <Text>{dayjs(dispatch.dispatchDate).format("DD-MM-YYYY")}</Text>
              </HStack>
              <Divider />

              <HStack justify="space-between">
                <Text fontWeight="bold">{t("Delivery Date")}:</Text>
                <Text>
                  {dispatch.deliveryDate
                    ? dayjs(dispatch.deliveryDate).format("DD-MM-YYYY")
                    : t("Not set")}
                </Text>
              </HStack>
              <Divider />

              <HStack justify="space-between">
                <Text fontWeight="bold">{t("Description")}:</Text>
                <Text>{dispatch.description || t("No description")}</Text>
              </HStack>
              <Divider />

              <HStack justify="space-between">
                <Text fontWeight="bold">{t("Status")}:</Text>
                <Badge
                  colorScheme={getStatusColor(dispatch.dispatchedStatus || "")}
                  size="lg"
                  p={2}
                >
                  {t(dispatch.dispatchedStatus || "") || t("Unknown")}
                </Badge>
              </HStack>
              <Divider />

              <HStack justify="space-between">
                <Text fontWeight="bold">{t("Supplier")}:</Text>
                <Text>
                  {dispatchWithDetails?.supplierName || dispatch.supplierId}
                </Text>
              </HStack>
              <Divider />

              <HStack justify="space-between">
                <Text fontWeight="bold">{t("Transporter")}:</Text>
                <Text>
                  {dispatchWithDetails?.transporterName ||
                    dispatch.transporterId}
                </Text>
              </HStack>
              <Divider />

              <HStack justify="space-between">
                <Text fontWeight="bold">{t("Total Units in Dispatch")}:</Text>
                <Badge colorScheme="blue" fontSize="md" p={2}>
                  {totalUnitsInDispatch}
                </Badge>
              </HStack>

              {dispatchWithDetails?.productsWithDetails &&
                dispatchWithDetails.productsWithDetails.length > 0 && (
                  <>
                    <Divider />
                    <Text fontWeight="bold" fontSize="lg">
                      {t("Products")}:
                    </Text>

                    <VStack spacing={3} align="stretch">
                      {dispatchWithDetails.productsWithDetails.map(
                        (product, index) => (
                          <Box
                            key={index}
                            p={4}
                            bg="gray.50"
                            borderRadius="md"
                            border="1px solid"
                            borderColor="gray.200"
                          >
                            <VStack align="stretch" spacing={3}>
                              <HStack justify="space-between">
                                <Text
                                  fontSize="lg"
                                  fontWeight="bold"
                                  color="blue.600"
                                >
                                  {product.name.toUpperCase()}
                                </Text>
                                {product.lotId && (
                                  <Badge colorScheme="green" size="sm">
                                    {t("Lot")}: {product.lotId}
                                  </Badge>
                                )}
                              </HStack>

                              <Divider />

                              <HStack justify="space-between">
                                <VStack align="start" spacing={2}>
                                  <Text fontSize="md">
                                    <Text as="span" fontWeight="medium">
                                      {t("Units")}:
                                    </Text>{" "}
                                    <Badge colorScheme="blue" ml={2}>
                                      {product.unitsNumber}
                                    </Badge>
                                  </Text>
                                  {/* <Text fontSize="md">
                                    <Text as="span" fontWeight="medium">
                                      {t("Loose Units")}:
                                    </Text>{" "}
                                    <Badge colorScheme="orange" ml={2}>
                                      {product.looseUnitsNumber}
                                    </Badge>
                                  </Text>
                                  <Text fontSize="md">
                                    <Text as="span" fontWeight="medium">
                                      {t("Total Units")}:
                                    </Text>{" "}
                                    <Badge colorScheme="green" ml={2}>
                                      {product.totalUnitsNumber}
                                    </Badge>
                                  </Text> */}
                                </VStack>

                                {product.palletNumber && (
                                  <VStack align="end" spacing={2}>
                                    <Text fontSize="md">
                                      <Text as="span" fontWeight="medium">
                                        {t("Pallet Number")}:
                                      </Text>{" "}
                                      <Badge colorScheme="purple" ml={2}>
                                        {product.palletNumber}
                                      </Badge>
                                    </Text>
                                  </VStack>
                                )}
                              </HStack>
                            </VStack>
                          </Box>
                        )
                      )}
                    </VStack>
                  </>
                )}
            </VStack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>{t("Close")}</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
