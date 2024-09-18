import { StatusBar } from "expo-status-bar";
import {
  View,
  Text,
  Image,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  CalendarDaysIcon,
  MagnifyingGlassIcon,
} from "react-native-heroicons/outline";
import { MapPinIcon } from "react-native-heroicons/solid";
import AppGradient from "@/components/AppGradient";
import { debounce } from "lodash";
import * as Progress from 'react-native-progress'
import { getData, storeData } from '../utils/asyncStorage'

import wind from "@/assets/icons/wind.png";
import humidity from "@/assets/icons/drop.png";
import sunrise from "@/assets/icons/sun.png";

import { useCallback, useEffect, useState } from "react";
import { fetchLocations, fetchWeatherForecast } from "../api/weather";
import { weatherImages } from "@/constants";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [showSearch, toggleSearch] = useState(false);
  const [locations, setLocations] = useState([]);
  const [weather, setWeather] = useState({});
  const [loading, setLoading] = useState(true);

  const handleLocation = (loc) => {
    console.log("location: ", loc);
    setLocations([]);
    toggleSearch(false);
    setLoading(true);
    fetchWeatherForecast({
      cityName: loc.name,
      days: "7",
    }).then((data) => {
      setWeather(data);
      setLoading(false);
      storeData('city', loc.name)
      console.log("got data:", data);
    });
  };

  const handleSearch = (value) => {
    if (value.length > 2) {
      fetchLocations({ cityName: value }).then((data) => {
        setLocations(data);
      });
    }
  };

  useEffect(() => {
    fetchWeatherData(); // Renamed to correct function name
  }, []);
  
  const fetchWeatherData = async () => {
    let myCity = await getData('city');
    let cityName = 'Tirana';
    if(myCity) cityName = myCity;

    fetchWeatherForecast({
      cityName,
      days: "7",
    }).then((data) => {
      setWeather(data);
      setLoading(false)
    });
  };

  const handleTextDebounce = useCallback(debounce(handleSearch, 100), [handleSearch]);

  const { current, location } = weather;

  return (
    <View className="flex-1 relative">
      <StatusBar style="light" />
      <AppGradient colors={["#072C5F", "#06599E", "#01D6F6"]}>
      {
        loading? (
          <View className="flex-1 flex-row justify-center items-center">
            <Progress.CircleSnail thickness={10} size={140} color="#FFFFFF"/>
              </View>
        ):(
          <SafeAreaView className="flex-1" style={{ paddingTop: insets.top }}>
            <View style={{ height: "7%" }} className="mx-4 relative z-50 pt-6">
              <View
                className="flex-row justify-end items-center rounded-full"
                style={{
                  backgroundColor: showSearch ? "#06599E" : "transparent",
                }}
              >
                {showSearch ? (
                  <TextInput
                        onChangeText={handleTextDebounce}
                        placeholder="Search"
                        placeholderTextColor={"white"}
                        className="pl-6 h-10 flex-1 text-base text-white"
                      />
                    ) : null}
      
                    <TouchableOpacity
                      onPress={() => toggleSearch(!showSearch)}
                      className="rounded-full p-3 m-1"
                      style={{ backgroundColor: "#041C3D" }}
                    >
                      <MagnifyingGlassIcon size={22} color={"white"} />
                    </TouchableOpacity>
                  </View>
                  {locations.length > 0 && showSearch ? (
                    <View className="absolute w-full bg-sky-400 top-16 rounded-3xl mt-5">
                      {locations.map((loc, index) => {
                        let showBorder = index + 1 != locations.length;
                        let borderClass = showBorder
                          ? "border-b-2 border-b-sky-600"
                          : "";
                        return (
                          <TouchableOpacity
                            key={index}
                            onPress={() => handleLocation(loc)}
                            className={
                              "flex-row items-center border-0 p-3 px-4 mb-1 " +
                             borderClass
                            }
                          >
                            <MapPinIcon size={20} color={"blue"} />
                            <Text className="text-black text-lg mg-2">
                              {loc?.name}, {loc?.country}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ) : null}
                </View>
      
                <View className="flex-1 justify-around mb-2">
                  <Text className="text-white text-center text-2xl font-bold ">
                    {location?.name + ","}
                    <Text className="text-lg font-semibold text-gray-300">
                      {" " + location?.country}
                    </Text>
                  </Text>
                  <View className="flex-row justify-center">
                    <Image
                      source={weatherImages[current?.condition?.text]}
                      className="w-52 h-52"
                    />
                  </View>
                  <View className="space-y-2">
                    <Text className="text-center font-bold text-white text-6xl ml-5">
                      {current?.temp_c}&#176;
                    </Text>
                    <Text className="text-center text-white text-xl ml-5 tracking-widest ml-1">
                      {current?.condition?.text}
                    </Text>
                  </View>
      
                  <View className="flex-row justify-between mx-4">
                    <View className="flex-row space-x-2 items-center">
                      <Image source={wind} className="h-6 w-6" />
                      <Text className="text-white font-semibold text-base">
                        {current?.wind_kph + " km/h"}
                      </Text>
                    </View>
                    <View className="flex-row space-x-2 items-center">
                      <Image source={humidity} className="h-6 w-6" />
                      <Text className="text-white font-semibold text-base">
                        {current?.humidity + "%"}
                      </Text>
                    </View>
                    <View className="flex-row space-x-2 items-center">
                      <Image source={sunrise} className="h-6 w-6" />
                      <Text className="text-white font-semibold text-base">{weather?.forecast?.forecastday[0]?.astro?.sunrise}</Text>
                    </View>
                  </View>
                </View>
                <View className="mb-2 space-y-2">
                  <View className="flex-row items-center mx-5 space-x-2">
                    <CalendarDaysIcon color={"white"} size={22} />
                    <Text className="text-white text-base">Daily Forecast</Text>
                  </View>
                  <ScrollView
                    horizontal
                    contentContainerStyle={{ paddingHorizontal: 15 }}
                    showsHorizontalScrollIndicator={false}
                  >
                    {weather?.forecast?.forecastday?.map((item, index) => {
                      let date = new Date(item.date);
                      let options = { weekday: "long" };
                      let dayName = date.toLocaleDateString("en-US", options);
                      return (
                        <View
                          key={index}
                          className="flex justify-center items-center w-24 rounded-3xl py-3 spacing-y-1 mr-4"
                          style={{ backgroundColor: "rgba(0,0,0,0.2)" }}
                        >
                          <Image
                            source={weatherImages[item?.day?.condition?.text]}
                            className="w-12 h-12"
                          />
                          <Text className="text-white">{dayName}</Text>
                          <Text className="text-white text-xl font-semibold">
                            {item?.day?.avgtemp_c}&#176;
                          </Text>
                        </View>
                      );
                    })}
                  </ScrollView>
                </View>
              </SafeAreaView>
              )
            }

      </AppGradient>
    </View>
  );
}
