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
      if (fetcher.data.error) {
        setError(fetcher.data.error);
      } else if (fetcher.data.allowedCountries) {
        setSelectedCountries(fetcher.data.allowedCountries);
      }
      setLoading(false);
    }
  }, [fetcher.data]);

  const handleCountryChange = (value) => {
    setSelectedCountries(prev => {
      const newSelection = prev.includes(value) 
        ? prev.filter(v => v !== value)
        : [...prev, value];
      
      // Save to metafield
      const formData = new FormData();
      formData.append("countries", JSON.stringify(newSelection));
      fetcher.submit(formData, { method: "POST", action: "/api/metafields" });
      
      return newSelection;
    });
  };

  const removeCountry = (valueToRemove) => {
    setSelectedCountries(prev => {
      const newSelection = prev.filter(value => value !== valueToRemove);
      
      // Save to metafield
      const formData = new FormData();
      formData.append("countries", JSON.stringify(newSelection));
      fetcher.submit(formData, { method: "POST", action: "/api/metafields" });
      
      return newSelection;
    });
  };

  const handleClearAll = () => {
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
            {error}
          </Banner>
        )}
        
        <Select
          label="Select countries"
          options={countries}
          onChange={handleCountryChange}
          value={selectedCountries}
          multiple
          placeholder="Choose countries..."
          helpText="Hold Ctrl (Windows) or Command (Mac) to select multiple countries"
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