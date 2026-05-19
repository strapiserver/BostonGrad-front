import { Box, HStack, List, ListItem, Text } from "@chakra-ui/react";
import React from "react";
import { FaGraduationCap } from "react-icons/fa";
import { RiMapPin2Fill, RiCustomerService2Fill } from "react-icons/ri";
import { IMainBenefit } from "../../../types/pages";

export default function Benefits({ benefits }: { benefits?: IMainBenefit[] }) {
  if (!benefits?.length) return null;
  const icons = [FaGraduationCap, RiMapPin2Fill, RiCustomerService2Fill];

  return (
    <Box
      bg="linear-gradient(180deg, rgba(120,40,40,0.45) 0%, rgba(70,20,20,0.45) 100%)"
      border="1px solid rgba(246,216,148,0.6)"
      borderRadius="2xl"
      px={{ base: "2", md: "5" }}
      py={{ base: "4", md: "4" }}
      boxShadow="inset 0 0 0 1px rgba(255,255,255,0.08)"
    >
      <List spacing={{ base: "3", md: "4" }}>
        {benefits
          .filter((item) => !!item?.text)
          .map((item, idx) => {
            const Icon = icons[idx % icons.length];
            return (
              <ListItem key={item.id || item.text} listStyleType="none">
                <HStack align="center" spacing={{ base: "3", md: "2" }}>
                  <Icon color="#f6d894" size={22} style={{ flexShrink: 0 }} />
                  <Text
                    color="white"
                    fontSize={{ base: "md", md: "xl" }}
                    lineHeight={{ base: "1.3", md: "1.3" }}
                    textShadow="0 1px 8px rgba(0,0,0,0.35)"
                    textTransform="none"
                    letterSpacing="normal"
                    fontWeight="700"
                  >
                    {item.text}
                  </Text>
                </HStack>
              </ListItem>
            );
          })}
      </List>
    </Box>
  );
}
