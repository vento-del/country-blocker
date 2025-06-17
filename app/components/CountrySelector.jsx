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

const countries = [
  { label: "Afghanistan", value: "AF" },
  { label: "Albania", value: "AL" },
  { label: "Algeria", value: "DZ" },
  { label: "Andorra", value: "AD" },
  { label: "Angola", value: "AO" },
  { label: "Antigua and Barbuda", value: "AG" },
  { label: "Argentina", value: "AR" },
  { label: "Armenia", value: "AM" },
  { label: "Australia", value: "AU" },
  { label: "Austria", value: "AT" },
  { label: "Azerbaijan", value: "AZ" },
  { label: "Bahamas", value: "BS" },
  { label: "Bahrain", value: "BH" },
  { label: "Bangladesh", value: "BD" },
  { label: "Barbados", value: "BB" },
  { label: "Belarus", value: "BY" },
  { label: "Belgium", value: "BE" },
  { label: "Belize", value: "BZ" },
  { label: "Benin", value: "BJ" },
  { label: "Bhutan", value: "BT" },
  { label: "Bolivia", value: "BO" },
  { label: "Bosnia and Herzegovina", value: "BA" },
  { label: "Botswana", value: "BW" },
  { label: "Brazil", value: "BR" },
  { label: "Brunei", value: "BN" },
  { label: "Bulgaria", value: "BG" },
  { label: "Burkina Faso", value: "BF" },
  { label: "Burundi", value: "BI" },
  { label: "Cambodia", value: "KH" },
  { label: "Cameroon", value: "CM" },
  { label: "Canada", value: "CA" },
  { label: "Cape Verde", value: "CV" },
  { label: "Central African Republic", value: "CF" },
  { label: "Chad", value: "TD" },
  { label: "Chile", value: "CL" },
  { label: "China", value: "CN" },
  { label: "Colombia", value: "CO" },
  { label: "Comoros", value: "KM" },
  { label: "Congo", value: "CG" },
  { label: "Costa Rica", value: "CR" },
  { label: "Croatia", value: "HR" },
  { label: "Cuba", value: "CU" },
  { label: "Cyprus", value: "CY" },
  { label: "Czech Republic", value: "CZ" },
  { label: "Denmark", value: "DK" },
  { label: "Djibouti", value: "DJ" },
  { label: "Dominica", value: "DM" },
  { label: "Dominican Republic", value: "DO" },
  { label: "Ecuador", value: "EC" },
  { label: "Egypt", value: "EG" },
  { label: "El Salvador", value: "SV" },
  { label: "Equatorial Guinea", value: "GQ" },
  { label: "Eritrea", value: "ER" },
  { label: "Estonia", value: "EE" },
  { label: "Eswatini", value: "SZ" },
  { label: "Ethiopia", value: "ET" },
  { label: "Fiji", value: "FJ" },
  { label: "Finland", value: "FI" },
  { label: "France", value: "FR" },
  { label: "Gabon", value: "GA" },
  { label: "Gambia", value: "GM" },
  { label: "Georgia", value: "GE" },
  { label: "Germany", value: "DE" },
  { label: "Ghana", value: "GH" },
  { label: "Greece", value: "GR" },
  { label: "Grenada", value: "GD" },
  { label: "Guatemala", value: "GT" },
  { label: "Guinea", value: "GN" },
  { label: "Guinea-Bissau", value: "GW" },
  { label: "Guyana", value: "GY" },
  { label: "Haiti", value: "HT" },
  { label: "Honduras", value: "HN" },
  { label: "Hungary", value: "HU" },
  { label: "Iceland", value: "IS" },
  { label: "India", value: "IN" },
  { label: "Indonesia", value: "ID" },
  { label: "Iran", value: "IR" },
  { label: "Iraq", value: "IQ" },
  { label: "Ireland", value: "IE" },
  { label: "Israel", value: "IL" },
  { label: "Italy", value: "IT" },
  { label: "Jamaica", value: "JM" },
  { label: "Japan", value: "JP" },
  { label: "Jordan", value: "JO" },
  { label: "Kazakhstan", value: "KZ" },
  { label: "Kenya", value: "KE" },
  { label: "Kiribati", value: "KI" },
  { label: "Kuwait", value: "KW" },
  { label: "Kyrgyzstan", value: "KG" },
  { label: "Laos", value: "LA" },
  { label: "Latvia", value: "LV" },
  { label: "Lebanon", value: "LB" },
  { label: "Lesotho", value: "LS" },
  { label: "Liberia", value: "LR" },
  { label: "Libya", value: "LY" },
  { label: "Liechtenstein", value: "LI" },
  { label: "Lithuania", value: "LT" },
  { label: "Luxembourg", value: "LU" },
  { label: "Madagascar", value: "MG" },
  { label: "Malawi", value: "MW" },
  { label: "Malaysia", value: "MY" },
  { label: "Maldives", value: "MV" },
  { label: "Mali", value: "ML" },
  { label: "Malta", value: "MT" },
  { label: "Marshall Islands", value: "MH" },
  { label: "Mauritania", value: "MR" },
  { label: "Mauritius", value: "MU" },
  { label: "Mexico", value: "MX" },
  { label: "Micronesia", value: "FM" },
  { label: "Moldova", value: "MD" },
  { label: "Monaco", value: "MC" },
  { label: "Mongolia", value: "MN" },
  { label: "Montenegro", value: "ME" },
  { label: "Morocco", value: "MA" },
  { label: "Mozambique", value: "MZ" },
  { label: "Myanmar", value: "MM" },
  { label: "Namibia", value: "NA" },
  { label: "Nauru", value: "NR" },
  { label: "Nepal", value: "NP" },
  { label: "Netherlands", value: "NL" },
  { label: "New Zealand", value: "NZ" },
  { label: "Nicaragua", value: "NI" },
  { label: "Niger", value: "NE" },
  { label: "Nigeria", value: "NG" },
  { label: "North Korea", value: "KP" },
  { label: "North Macedonia", value: "MK" },
  { label: "Norway", value: "NO" },
  { label: "Oman", value: "OM" },
  { label: "Pakistan", value: "PK" },
  { label: "Palau", value: "PW" },
  { label: "Palestine", value: "PS" },
  { label: "Panama", value: "PA" },
  { label: "Papua New Guinea", value: "PG" },
  { label: "Paraguay", value: "PY" },
  { label: "Peru", value: "PE" },
  { label: "Philippines", value: "PH" },
  { label: "Poland", value: "PL" },
  { label: "Portugal", value: "PT" },
  { label: "Qatar", value: "QA" },
  { label: "Romania", value: "RO" },
  { label: "Russia", value: "RU" },
  { label: "Rwanda", value: "RW" },
  { label: "Saint Kitts and Nevis", value: "KN" },
  { label: "Saint Lucia", value: "LC" },
  { label: "Saint Vincent and the Grenadines", value: "VC" },
  { label: "Samoa", value: "WS" },
  { label: "San Marino", value: "SM" },
  { label: "Sao Tome and Principe", value: "ST" },
  { label: "Saudi Arabia", value: "SA" },
  { label: "Senegal", value: "SN" },
  { label: "Serbia", value: "RS" },
  { label: "Seychelles", value: "SC" },
  { label: "Sierra Leone", value: "SL" },
  { label: "Singapore", value: "SG" },
  { label: "Slovakia", value: "SK" },
  { label: "Slovenia", value: "SI" },
  { label: "Solomon Islands", value: "SB" },
  { label: "Somalia", value: "SO" },
  { label: "South Africa", value: "ZA" },
  { label: "South Korea", value: "KR" },
  { label: "South Sudan", value: "SS" },
  { label: "Spain", value: "ES" },
  { label: "Sri Lanka", value: "LK" },
  { label: "Sudan", value: "SD" },
  { label: "Suriname", value: "SR" },
  { label: "Sweden", value: "SE" },
  { label: "Switzerland", value: "CH" },
  { label: "Syria", value: "SY" },
  { label: "Taiwan", value: "TW" },
  { label: "Tajikistan", value: "TJ" },
  { label: "Tanzania", value: "TZ" },
  { label: "Thailand", value: "TH" },
  { label: "Timor-Leste", value: "TL" },
  { label: "Togo", value: "TG" },
  { label: "Tonga", value: "TO" },
  { label: "Trinidad and Tobago", value: "TT" },
  { label: "Tunisia", value: "TN" },
  { label: "Turkey", value: "TR" },
  { label: "Turkmenistan", value: "TM" },
  { label: "Tuvalu", value: "TV" },
  { label: "Uganda", value: "UG" },
  { label: "Ukraine", value: "UA" },
  { label: "United Arab Emirates", value: "AE" },
  { label: "United Kingdom", value: "GB" },
  { label: "United States", value: "US" },
  { label: "Uruguay", value: "UY" },
  { label: "Uzbekistan", value: "UZ" },
  { label: "Vanuatu", value: "VU" },
  { label: "Vatican City", value: "VA" },
  { label: "Venezuela", value: "VE" },
  { label: "Vietnam", value: "VN" },
  { label: "Yemen", value: "YE" },
  { label: "Zambia", value: "ZM" },
  { label: "Zimbabwe", value: "ZW" }
];

export default function CountrySelector({ disabled, selectedCountries: initialSelectedCountries, onChange }) {
  const [selectedCountries, setSelectedCountries] = useState(initialSelectedCountries || []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedValue, setSelectedValue] = useState("");
  const fetcher = useFetcher();

  useEffect(() => {
    // If initialSelectedCountries is provided, use it
    if (initialSelectedCountries) {
      setSelectedCountries(initialSelectedCountries);
      setLoading(false);
    } else {
      // Otherwise load saved countries when component mounts
      fetcher.load("/api/metafields");
    }
  }, [initialSelectedCountries]);

  useEffect(() => {
    if (fetcher.data) {
      console.log("Fetcher data received:", fetcher.data);
      if (fetcher.data.error) {
        setError(fetcher.data.error);
        console.error("Error from API:", fetcher.data.error);
      } else if (fetcher.data.allowedCountries) {
        setSelectedCountries(fetcher.data.allowedCountries);
        if (onChange) {
          onChange(fetcher.data.allowedCountries);
        }
        console.log("Countries loaded:", fetcher.data.allowedCountries);
      }
      setLoading(false);
    }
  }, [fetcher.data, onChange]);

  const handleCountryChange = (value) => {
    if (disabled) return;
    
    console.log("Country selected:", value);
    setSelectedValue(value);
    if (value && !selectedCountries.includes(value)) {
      const newSelection = [...selectedCountries, value];
      setSelectedCountries(newSelection);
      
      // Call onChange if provided
      if (onChange) {
        onChange(newSelection);
      }
      
      // Save to metafield
      const formData = new FormData();
      formData.append("countries", JSON.stringify(newSelection));
      fetcher.submit(formData, { method: "POST", action: "/api/metafields" });
    }
    setSelectedValue("");
  };

  const removeCountry = (valueToRemove) => {
    if (disabled) return;
    
    console.log("Removing country:", valueToRemove);
    const newSelection = selectedCountries.filter(value => value !== valueToRemove);
    setSelectedCountries(newSelection);
    
    // Call onChange if provided
    if (onChange) {
      onChange(newSelection);
    }
    
    // Save to metafield
    const formData = new FormData();
    formData.append("countries", JSON.stringify(newSelection));
    fetcher.submit(formData, { method: "POST", action: "/api/metafields" });
  };

  const handleClearAll = () => {
    if (disabled) return;
    
    console.log("Clearing all countries");
    setSelectedCountries([]);
    
    // Call onChange if provided
    if (onChange) {
      onChange([]);
    }
    
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
    <BlockStack gap="400">
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
        disabled={disabled}
      />
      
      <InlineStack gap="300" wrap={false}>
        <Button 
          onClick={handleClearAll}
          disabled={disabled}
        >
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
                <Tag 
                  key={value} 
                  onRemove={disabled ? undefined : () => removeCountry(value)}
                  disabled={disabled}
                >
                  {country?.label}
                </Tag>
              );
            })}
          </InlineStack>
        </BlockStack>
      )}
    </BlockStack>
  );
} 