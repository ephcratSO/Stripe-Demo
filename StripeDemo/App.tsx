import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  Image,
} from "react-native";
import { StripeProvider, useStripe } from "@stripe/stripe-react-native";
import { stripePublishableKey } from "./secrets";

const PayButton = () => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);
  const fetchPaymentIntent = async () => {
    const response = await fetch("http://192.168.0.34:3005/payment-intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: 10000, // Hardcoded amount
      }),
    });
    const { paymentIntent } = await response.json();
    return paymentIntent;
  };

  const handlePayPress = async () => {
    setLoading(true);

    const paymentIntentClientSecret = await fetchPaymentIntent();
    const { error } = await initPaymentSheet({
      paymentIntentClientSecret,
      merchantDisplayName: "Ale",
    });

    if (!error) {
      const { error } = await presentPaymentSheet();
      if (error) {
        Alert.alert("Payment Failed", error.message);
      } else {
        Alert.alert("Payment Successful");
      }
    } else {
      Alert.alert("Payment Failed", error.message);
    }

    setLoading(false);
  };

  return (
    <TouchableOpacity style={styles.payButton} onPress={handlePayPress}>
      <Text style={styles.payButtonText}>Pay</Text>
    </TouchableOpacity>
  );
};

export default function App() {
  return (
    <StripeProvider publishableKey={stripePublishableKey}>
      <View style={styles.container}>
        <Image
          source={{
            uri: "https://static.nike.com/a/images/t_default/8cebb962-98cd-4e3c-9824-ef05c296401b/atlanta-braves-city-connect-ronald-acu%C3%B1a-jr-mens-replica-baseball-jersey-jjxH9B.png",
          }} // Replace with the path to your baseball jersey image
          style={styles.productImage}
          resizeMode="contain"
        />
        <Text style={styles.productName}>Braves Jersey</Text>
        <Text style={styles.productPrice}>$100.00</Text>
        <PayButton />
      </View>
    </StripeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  productImage: {
    width: "100%",
    height: 200,
  },
  productName: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  productPrice: {
    fontSize: 18,
    marginBottom: 20,
  },
  payButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  payButtonText: {
    color: "#FFF",
    fontSize: 16,
  },
});
