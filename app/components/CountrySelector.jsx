import { useState, useEffect } from "react";
import {
  Card,
  Button,
  BlockStack,
  Text,
  InlineStack,
  Tag,
  Select,
  Banner,
  Spinner,
} from "@shopify/polaris";
import { useFetcher } from "@remix-run/react";

export default function CountrySelector() {
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedValue, setSelectedValue] = useState("");
  const fetcher = useFetcher();

  const countries = [
    {label: "United States", value: "US"},
    {label: "Canada", value: "CA"},
    {label: "United Kingdom", value: "GB"},
    {label: "Australia", value: "AU"},
    {label: "Germany", value: "DE"},
    {label: "France", value: "FR"},
    {label: "Japan", value: "JP"},
    {label: "India", value: "IN"},
    {label: "Brazil", value: "BR"},
    {label: "Mexico", value: "MX"},
  ];

  useEffect(() => {
    // Load saved countries when component mounts
    fetcher.load("/api/metafields");
  }, []);

  useEffect(() => {
    if (fetcher.data) {
      console.log("Fetcher data received:", fetcher.data);
      if (fetcher.data.error) {
        setError(fetcher.data.error);
        console.error("Error from API:", fetcher.data.error);
      } else if (fetcher.data.allowedCountries) {
        setSelectedCountries(fetcher.data.allowedCountries);
        console.log("Countries loaded:", fetcher.data.allowedCountries);
      }
      setLoading(false);
    }
  }, [fetcher.data]);

  const handleCountryChange = (value) => {
    console.log("Country selected:", value);
    setSelectedValue(value);
    if (value && !selectedCountries.includes(value)) {
      const newSelection = [...selectedCountries, value];
      setSelectedCountries(newSelection);
      
      // Save to metafield
      const formData = new FormData();
      formData.append("countries", JSON.stringify(newSelection));
      fetcher.submit(formData, { method: "POST", action: "/api/metafields" });
    }
    setSelectedValue("");
  };

  const removeCountry = (valueToRemove) => {
    console.log("Removing country:", valueToRemove);
    const newSelection = selectedCountries.filter(value => value !== valueToRemove);
    setSelectedCountries(newSelection);
    
    // Save to metafield
    const formData = new FormData();
    formData.append("countries", JSON.stringify(newSelection));
    fetcher.submit(formData, { method: "POST", action: "/api/metafields" });
  };

  const handleClearAll = () => {
    console.log("Clearing all countries");
    setSelectedCountries([]);
    const formData = new FormData();
    formData.append("countries", JSON.stringify([]));
    fetcher.submit(formData, { method: "POST", action: "/api/metafields" });
  };

  if (loading) {
    return (
      <Card>
        <BlockStack gap="400" align="center">
          <Spinner size="large" />
          <Text as="p" variant="bodyMd">Loading country settings...</Text>
        </BlockStack>
      </Card>
    );
  }

  return (
    <Card>
      <BlockStack gap="400">
        <Text variant="headingMd" as="h2">Country Selection</Text>
        
        {error && (
          <Banner status="critical">
            <p>Error: {error}</p>
            {fetcher.data?.details && (
              <p>Details: {JSON.stringify(fetcher.data.details)}</p>
            )}
          </Banner>
        )}
        
        <Select
          label="Select a country"
          options={countries}
          onChange={handleCountryChange}
          value={selectedValue}
          placeholder="Choose a country..."
          helpText="Select one country at a time"
        />
        
        <InlineStack gap="300" wrap={false}>
          <Button onClick={handleClearAll}>
            Clear All
          </Button>
          {selectedCountries.length > 0 && (
            <Text variant="bodySm" as="p" color="subdued">
              {selectedCountries.length} {selectedCountries.length === 1 ? 'country' : 'countries'} selected
            </Text>
          )}
        </InlineStack>

        {selectedCountries.length > 0 && (
          <BlockStack gap="300">
            <Text variant="headingSm" as="h3">Selected Countries:</Text>
            <InlineStack gap="300" wrap>
              {selectedCountries.map((value) => {
                const country = countries.find(c => c.value === value);
                return (
                  <Tag key={value} onRemove={() => removeCountry(value)}>
                    {country?.label}
                  </Tag>
                );
              })}
            </InlineStack>
          </BlockStack>
        )}
      </BlockStack>
    </Card>
  );
} 