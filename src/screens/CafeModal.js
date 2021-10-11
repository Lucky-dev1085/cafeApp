import React, { useState, useEffect } from 'react';
import {
  View, StyleSheet,
  TouchableOpacity, StatusBar,
  Dimensions, Image
} from 'react-native';
import Clipboard from '@react-native-community/clipboard';
import { useDispatch, useSelector } from "react-redux";

import Carousel from 'react-native-snap-carousel';

import { scrollInterpolator, animatedStyles } from '@utils/animations';

import Toast from 'react-native-easy-toast'
import Modal from "react-native-modal";

import GestureRecognizer from 'react-native-swipe-gestures';

import Geolocation from '@react-native-community/geolocation';
import MapboxGL from "@react-native-mapbox-gl/maps";
import moment from 'moment';

Geolocation.setRNConfiguration({ skipPermissionRequests: false, authorizationLevel: 'whenInUse' });
MapboxGL.setAccessToken("pk.eyJ1IjoiY2hlYnVyaXNoa2EiLCJhIjoiY2s2OGYwaGU2MDM5eTNwbzNpc3FjZTA5dCJ9.oZPv-zYK0gJMsNUpGyiVMA");

import { FontText } from '@components';

import { setSelectedFeature, setNormalCard, setSelectedSubFeatureIndex } from '@modules/reducers/cafe/actions';

import marker from '../assets/marker.png';
import markerPin from '../assets/marker-select.png';
import mylocation from '../assets/mylocation.png';

import FeatureCollection from '../data/FeatureCollection';

const Icons = {
  noise: {
    "": require('../assets/noise-green-icon.png'),
    "Low": require('../assets/noise-green-icon.png'),
    "Moderate to low": require('../assets/noise-green-icon.png'),
    "Moderate": require('../assets/noise-green-icon.png'),
    "Heavy": require('../assets/noise-green-icon.png'),
  },
  outlet: {
    "": require('../assets/outlet-green-icon.png'),
    "None": require('../assets/outlet-green-icon.png'),
    "Limited": require('../assets/outlet-green-icon.png'),
    "Good": require('../assets/outlet-green-icon.png'),
    "Plenty": require('../assets/outlet-green-icon.png'),
  }
};

const Colors = {
  noise: {
    "Low": "#00D085",
    "Moderate to low": "#00D085",
    "Moderate": "#FFA421",
    "Heavy": "#FF304F",
  },
  outlet: {
    "None": "#FF304F",
    "Limited": "#FFA421",
    "Good": "#00D085",
    "Plenty": "#00D085",
  }
};

const markerData = FeatureCollection.features;

const imageRoot = 'https://cdn1.coldbrew.app/images/';

const FirstMarkerCoords = [
  markerData[0].properties.LONGITUDE,
  markerData[0].properties.LATITUDE
]

const { width, height } = Dimensions.get('window');
const modalHeight = 600;

const CafeItem = ({ cafeItem, index, cafePress, checkIfOpenItem, displayOpeningHoursItem, displayAdditionalTextItem }) => {
  const additionals = displayAdditionalTextItem(cafeItem.item.properties);

  return (
    <TouchableOpacity style={styleOf.cardItem} activeOpacity={1} onPress={() => { cafePress(true, cafeItem.item.properties); console.log("=========================") }}>
      <View style={styleOf.cardContentTitleSection}>
        <View style={styleOf.cardContentTitle}>
          <FontText font='SFProDisplay-Regular' numberOfLines={1} style={{ color: '#002651', fontSize: 20, fontWeight: '400', lineHeight: 28, width: '75%' }}>
            {cafeItem.item.properties.NAME}
          </FontText>
          <View style={{ backgroundColor: (checkIfOpenItem(cafeItem.item.properties) ? '#6C5DD3' : '#FF754C'), paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
            <FontText font='SFProDisplay-Regular' style={{ color: '#FFF', fontSize: 14, lineHeight: 18 }}>
              {checkIfOpenItem(cafeItem.item.properties) ? 'Open' : 'Closed'}
            </FontText>
          </View>
        </View>

        <View style={styleOf.cardContentTitleRateOpenTime}>
          <View style={styleOf.cardContentTitleRate}>
            <Image source={require('../assets/star-icon.png')} style={{ width: 20, height: 20, marginRight: 5, marginBottom: 1.5, }} />
            <FontText style={{ color: '#FFA421', fontSize: 12, fontWeight: '500', lineHeight: 16, marginRight: 10 }}>
              {cafeItem.item.properties.WORKABILITY}
            </FontText>
          </View>

          <FontText font='SFProDisplay-Regular' style={{ color: '#8B9CAF', fontSize: 12, lineHeight: 16, fontWeight: '500' }}>
            {displayOpeningHoursItem(cafeItem.item.properties)}
          </FontText>
        </View>
      </View>

      <View style={styleOf.cardContentRatingsSection}>
        <View style={styleOf.cardContentRatingsRow}>
          <View style={styleOf.cardContentRatingsCols}>
            <Image source={require('../assets/food-green-icon.png')} style={styleOf.cardContentRatingsImage} />
            <View style={{ flexDirection: 'column' }}>
              <FontText style={styleOf.cardContentRatingsColTitle}>Food Quality</FontText>
              <FontText numberOfLines={1} style={styleOf.cardContentRatingsColDesc}>Excellent</FontText>
            </View>
          </View>
          <View style={styleOf.cardContentRatingsCols}>
            <Image source={Icons.outlet[cafeItem.item.properties['ACCESSIBLE OUTLETS']]} style={styleOf.cardContentRatingsImage} />
            <View style={{ flexDirection: 'column' }}>
              <FontText style={styleOf.cardContentRatingsColTitle}>Outlets</FontText>
              <FontText numberOfLines={1} style={[
                styleOf.cardContentRatingsColDesc
              ]}>
                {cafeItem.item.properties['ACCESSIBLE OUTLETS']}
              </FontText>
            </View>
          </View>
        </View>
        <View style={styleOf.cardContentRatingsRow}>
          <View style={styleOf.cardContentRatingsCols}>
            <Image source={require('../assets/table-green-icon.png')} style={styleOf.cardContentRatingsImage} />
            <View style={{ flexDirection: 'column' }}>
              <FontText style={styleOf.cardContentRatingsColTitle}>Seating</FontText>
              <FontText numberOfLines={1} style={styleOf.cardContentRatingsColDesc}>{cafeItem.item.properties['TYPES OF SEATING']}</FontText>
            </View>
          </View>
          <View style={styleOf.cardContentRatingsCols}>
            <Image source={Icons.noise[cafeItem.item.properties['BACKGROUND NOISE']]} style={styleOf.cardContentRatingsImage} />
            <View style={{ flexDirection: 'column' }}>
              <FontText style={styleOf.cardContentRatingsColTitle}>Noise level</FontText>
              <FontText numberOfLines={1} style={[
                styleOf.cardContentRatingsColDesc
              ]}>
                {cafeItem.item.properties['BACKGROUND NOISE']}
              </FontText>
            </View>
          </View>
        </View>
      </View>

      <View style={styleOf.cardContentAdditionalSection}>
        <View style={styleOf.cardContentAdditionalItem}>
          <Image source={additionals[0]['value'] ? require('../assets/additional_check.png') : require('../assets/additional_cancel.png')} style={{ width: 14, height: 14, marginRight: 10, }} />
          <FontText style={styleOf.cardContentAdditionalText}>
            {additionals[0]['key'] == '-' ? 'Public' : additionals[0]['key']}
          </FontText>
        </View>
        <View style={styleOf.cardContentAdditionalItem}>
          <Image source={additionals[1]['value'] ? require('../assets/additional_check.png') : require('../assets/additional_cancel.png')} style={{ width: 14, height: 14, marginRight: 10, }} />
          <FontText style={styleOf.cardContentAdditionalText}>
            {additionals[1]['key']}
          </FontText>
        </View>
        <View style={styleOf.cardContentAdditionalItem}>
          <Image source={additionals[2]['value'] ? require('../assets/additional_check.png') : require('../assets/additional_cancel.png')} style={{ width: 14, height: 14, marginRight: 10, }} />
          <FontText style={styleOf.cardContentAdditionalText}>
            {additionals[2]['key']}
          </FontText>
        </View>
      </View>
      <View style={styleOf.cardContentAdditionalSection}>
        <View style={styleOf.cardContentAdditionalItem}>
          <Image source={additionals[3]['value'] ? require('../assets/additional_check.png') : require('../assets/additional_cancel.png')} style={{ width: 14, height: 14, marginRight: 10, }} />
          <FontText style={styleOf.cardContentAdditionalText}>
            {additionals[3]['key']}
          </FontText>
        </View>
        <View style={styleOf.cardContentAdditionalItem}>
          <Image source={additionals[4]['value'] ? require('../assets/additional_check.png') : require('../assets/additional_cancel.png')} style={{ width: 14, height: 14, marginRight: 10, }} />
          <FontText style={styleOf.cardContentAdditionalText}>
            {additionals[4]['key']}
          </FontText>
        </View>
      </View>
      <View style={styleOf.cardContentAdditionalSection}>
        <View style={styleOf.cardContentAdditionalItem}>
          <Image source={additionals[5]['value'] ? require('../assets/additional_check.png') : require('../assets/additional_cancel.png')} style={{ width: 14, height: 14, marginRight: 10, }} />
          <FontText style={styleOf.cardContentAdditionalText}>
            {additionals[5]['key']}
          </FontText>
        </View>
        <View style={styleOf.cardContentAdditionalItem}>
          <Image source={additionals[6]['value'] ? require('../assets/additional_check.png') : require('../assets/additional_cancel.png')} style={{ width: 14, height: 14, marginRight: 10, }} />
          <FontText style={styleOf.cardContentAdditionalText}>
            {additionals[6]['key']}
          </FontText>
        </View>
      </View>

    </TouchableOpacity>
  )
}

export default CafeModal = (props) => {
  const dispatch = useDispatch();

  const { selectedFeature, selectedFeatureIndex, normalCard, selectedSubFeatures, selectedSubFeatureIndex } = useSelector((state) => state.cafe);

  const [featureCollection, setFeatureCollection] = useState(props.featureCollection);
  const [currentDay, setCurrnetDay] = useState(moment().format('ddd').toUpperCase());
  // const [currentCoords, setCurrentCoords] = useState(FirstMarkerCoords);
  const [modalVisible, setModalVisible] = useState(false);
  const [markerLoading, setMarkerLoading] = useState(false);
  const [selAdditionals, setSelAdditionals] = useState([]);

  console.log("------------- cafe modal : ", selectedSubFeatureIndex, normalCard, selectedSubFeatures.length);

  let flatListRef = null;
  let modalToast = null;

  useEffect(() => {
    if (selectedSubFeatures.length != 0) flatListRef.snapToItem(selectedSubFeatureIndex, true, true);
    console.log("********************************** useeffect selectedSubFeatureIndex: ", selectedSubFeatureIndex);
  }, [selectedSubFeatureIndex]);

  const copyNameToClipboard = () => {
    let selected_Feature = selectedFeature;
    Clipboard.setString(selected_Feature['WIFI USERNAME']);
    modalToast.show('Name copied to clipboard');
  }

  const copyPasswordToClipboard = () => {
    let selected_Feature = selectedFeature;
    Clipboard.setString(selected_Feature['WIFI PASSWORD']);
    modalToast.show('Password copied to clipboard');
  }

  const displayAdditionalText = (selected_Feature) => {
    let additionals = [];

    additionals.push({ key: selected_Feature['TYPE OF SPACE'], value: selected_Feature['TYPE OF SPACE'] != '-' });
    additionals.push({ key: 'Tea', value: selected_Feature['TEA'] != '-' });
    additionals.push({ key: 'Food', value: selected_Feature['FOOD'] != '-' });
    additionals.push({ key: 'Coffee', value: selected_Feature['COFFEE'] != '-' });
    additionals.push({ key: 'Alcohol', value: selected_Feature['ALCOHOL'] != '-' });
    additionals.push({ key: 'Group seating', value: selected_Feature['GROUP SEATING'] != '-' });
    additionals.push({ key: 'Outdoor seating', value: selected_Feature['OUTDOOR SEATING'] != '-' });

    setSelAdditionals(additionals);
  }

  const isTimeTodayBetween = (start, end) => {
    const startTime = moment(start, "hh:mma");
    const endTime = moment(end, "hh:mma");
    const now = moment();
    const today = moment().format("YYYY-MM-DD");

    // If the working hours are longer than 24h
    if (endTime.isBefore(startTime))
      return now.isAfter(startTime) || now.isBefore(endTime);
    // If the working hours are in 24h interval
    else
      return now.isAfter(startTime) && now.isBefore(endTime);
  }

  const checkIfOpen = () => {
    let selected_Feature = selectedFeature;
    let todayDDD = currentDay;

    let todayOpen = selected_Feature[`${todayDDD} OPEN`];
    let todayClose = selected_Feature[`${todayDDD} CLOSE`];

    if (todayOpen == 'may be closed' || todayClose == 'may be closed')
      return false
    else if (todayOpen == 'all day (24hrs)' || todayClose == 'all day (24hrs)')
      return true
    else
      return isTimeTodayBetween(todayOpen, todayClose)
  }

  const displayOpeningHours = () => {
    let selected_Feature = selectedFeature;
    let todayDDD = currentDay;

    let todayOpen = selected_Feature[`${todayDDD} OPEN`];
    let todayClose = selected_Feature[`${todayDDD} CLOSE`];

    if (!todayOpen || !todayClose || todayOpen == 'may be closed' || todayClose == 'may be closed') {
      return null;
    }
    else {
      todayOpen = moment(todayOpen, "hh:mma").format("H:mm");
      todayClose = moment(todayClose, "hh:mma").format("H:mm");
      return `${todayOpen} - ${todayClose}`;
    }
  }

  const cafePress = (check, item) => {
    if (normalCard == true) {
      const feature = item;
      const features = selectedSubFeatures;

      const selected_feature = features.find(mrk => mrk.properties.ID === feature.ID);

      if (feature.ID) {
        const selected_index = features.findIndex(mrk => mrk.properties.ID === feature.ID);

        console.log(feature.ID, " : ", selected_index);
        dispatch(setSelectedFeature(selected_feature.properties));

        dispatch(setSelectedSubFeatureIndex(selected_index));
        displayAdditionalText(selected_feature.properties);
        setModalVisible(true);
        setMarkerLoading(false);
      }
    } else {
      dispatch(setNormalCard(check));
    }
  }

  const checkIfOpenItem = (item) => {
    let selected_Feature = item;
    let todayDDD = currentDay;

    let todayOpen = selected_Feature[`${todayDDD} OPEN`];
    let todayClose = selected_Feature[`${todayDDD} CLOSE`];

    if (todayOpen == 'may be closed' || todayClose == 'may be closed')
      return false
    else if (todayOpen == 'all day (24hrs)' || todayClose == 'all day (24hrs)')
      return true
    else
      return isTimeTodayBetween(todayOpen, todayClose)
  }

  const displayOpeningHoursItem = (item) => {
    let selected_Feature = item;
    let todayDDD = currentDay;

    let todayOpen = selected_Feature[`${todayDDD} OPEN`];
    let todayClose = selected_Feature[`${todayDDD} CLOSE`];

    if (!todayOpen || !todayClose || todayOpen == 'may be closed' || todayClose == 'may be closed') {
      return "";
    }
    else {
      todayOpen = moment(todayOpen, "hh:mma").format("H:mm");
      todayClose = moment(todayClose, "hh:mma").format("H:mm");
      return `${todayOpen} - ${todayClose}`;
    }
  }

  const displayAdditionalTextItem = (item) => {
    let selected_Feature = item;

    let additionals = [];

    additionals.push({ key: selected_Feature['TYPE OF SPACE'], value: selected_Feature['TYPE OF SPACE'] != '-' });
    additionals.push({ key: 'Tea', value: selected_Feature['TEA'] != '-' });
    additionals.push({ key: 'Food', value: selected_Feature['FOOD'] != '-' });
    additionals.push({ key: 'Coffee', value: selected_Feature['COFFEE'] != '-' });
    additionals.push({ key: 'Alcohol', value: selected_Feature['ALCOHOL'] != '-' });
    additionals.push({ key: 'Group seating', value: selected_Feature['GROUP SEATING'] != '-' });
    additionals.push({ key: 'Outdoor seating', value: selected_Feature['OUTDOOR SEATING'] != '-' });

    return additionals;
  }

  const setScrollItem = (index) => {
    dispatch(setSelectedSubFeatureIndex(index));

    dispatch(setSelectedFeature(selectedSubFeatures[index].properties));
    console.log("index", index, " : ", selectedSubFeatures[index].properties.LATITUDE, " : ", selectedSubFeatures[index].properties.LONGITUDE);
  }

  const onSwipeUp = (state) => {
    console.log("++++++++++++++++ up +++++++++++++");
    dispatch(setNormalCard(true));
    if (normalCard == true) {
      console.log(selectedFeature.ID, " : ", selectedSubFeatureIndex);
      displayAdditionalText(selectedFeature);
      setModalVisible(true);
      setMarkerLoading(false);
    }
  }

  const onSwipeDown = (state) => {
    console.log("++++++++++++++++ down +++++++++++++");
    dispatch(setNormalCard(false));
  }

  const onSwipeLeft = (state) => {
    console.log("++++++++++++++++ left +++++++++++++");
    flatListRef.snapToNext(true, true);
  }

  const onSwipeRight = (state) => {
    console.log("++++++++++++++++ right +++++++++++++");
    flatListRef.snapToPrev(true, true);
  }

  return (
    <View style={styleOf.container}>
      <StatusBar backgroundColor={modalVisible ? 'rgba(0,0,0,0.2)' : 'transparent'} barStyle="dark-content" translucent={true} />

      {(selectedSubFeatures.length != 0) && (
        <GestureRecognizer style={normalCard ? styleOf.cardContainerNormal : styleOf.cardContainer} onSwipeUp={(state) => onSwipeUp(state)} onSwipeDown={(state) => onSwipeDown(state)} onSwipeLeft={(state) => onSwipeLeft(state)} onSwipeRight={(state) => onSwipeRight(state)}>
          <Carousel
            ref={(c) => flatListRef = c}
            data={selectedSubFeatures}
            renderItem={(cafeItem, index) => (
              <CafeItem
                index={index}
                cafeItem={cafeItem}
                cafePress={(check, item) => { cafePress(check, item); console.log("press cafe item") }}
                checkIfOpenItem={(item) => checkIfOpenItem(item)}
                displayOpeningHoursItem={(item) => displayOpeningHoursItem(item)}
                displayAdditionalTextItem={(item) => displayAdditionalTextItem(item)} />
            )}
            sliderWidth={width}
            itemWidth={width - 60}
            containerCustomStyle={styleOf.cardList}
            inactiveSlideShift={0}
            onSnapToItem={(index) => setScrollItem(index)}
            scrollInterpolator={scrollInterpolator}
            slideInterpolatedStyle={animatedStyles}
            useScrollView={false}
          />
        </GestureRecognizer>
      )}

      <Modal
        propagateSwipe={true}
        hideModalContentWhileAnimating={true}
        hasBackdrop={true}
        backdropColor='rgba(0,0,0,0.3)'
        swipeDirection='down'
        onSwipeThreshold={100}
        animationIn='slideInUp'
        animationInTiming={0}
        animationOut='slideOutDown'
        animationOutTiming={0}
        onSwipeComplete={() => setModalVisible(false)}
        isVisible={modalVisible}
        style={styleOf.modal}>
        <View style={styleOf.modalWrapper}>
          {(selectedFeature.length != 0) && (
            <View style={styleOf.modalContentWrapper}>
              <View style={styleOf.modalContentImageSection}>
                <TouchableOpacity
                  style={styleOf.modalBackButton}
                  onPress={() => setModalVisible(false)}>
                  <Image source={require('../assets/back-icon.png')} style={{ resizeMode: 'contain', width: 40, height: 40 }} />
                </TouchableOpacity>
                <Image
                  source={{ uri: `${imageRoot}${selectedFeature['NEW IMG NAMES'].split('|')[0]}` }}
                  style={styleOf.modalContentImage} />
              </View>

              <View style={styleOf.modalContent}>

                <View style={styleOf.modalContentTitleSection}>
                  <View style={styleOf.modalContentTitle}>
                    <FontText font='SFProDisplay-Regular' numberOfLines={1} style={{ color: '#002651', fontSize: 20, fontWeight: '400', lineHeight: 28, width: '80%' }}>
                      {selectedFeature.NAME}
                    </FontText>
                    <View style={{ backgroundColor: (checkIfOpen() ? '#6C5DD3' : '#FF754C'), paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                      <FontText font='SFProDisplay-Regular' style={{ color: '#FFF', fontSize: 14, lineHeight: 18 }}>
                        {checkIfOpen() ? 'Open' : 'Closed'}
                      </FontText>
                    </View>
                  </View>

                  <View style={styleOf.modalContentTitleRateOpenTime}>
                    <View style={styleOf.modalContentTitleRate}>
                      <Image source={require('../assets/star-icon.png')} style={{ width: 20, height: 20, marginRight: 5, marginBottom: 1.5, }} />
                      <FontText style={{ color: '#FFA421', fontSize: 12, fontWeight: '500', lineHeight: 16, marginRight: 10 }}>
                        {selectedFeature.WORKABILITY}
                      </FontText>
                    </View>

                    <FontText font='SFProDisplay-Regular' style={{ color: '#8B9CAF', fontSize: 12, lineHeight: 16, fontWeight: '500' }}>
                      {displayOpeningHours()}
                    </FontText>
                  </View>
                </View>

                <View style={styleOf.modalContentRatingsSection}>
                  <View style={styleOf.modalContentRatingsRow}>
                    <View style={styleOf.modalContentRatingsCols}>
                      <Image source={require('../assets/food-green-icon.png')} style={styleOf.modalContentRatingsImage} />
                      <View style={{ flexDirection: 'column' }}>
                        <FontText style={styleOf.modalContentRatingsColTitle}>Food Quality</FontText>
                        <FontText numberOfLines={1} style={styleOf.modalContentRatingsColDesc}>Excellent</FontText>
                      </View>
                    </View>
                    <View style={styleOf.modalContentRatingsCols}>
                      <Image source={Icons.outlet[selectedFeature['ACCESSIBLE OUTLETS']]} style={styleOf.modalContentRatingsImage} />
                      <View style={{ flexDirection: 'column' }}>
                        <FontText style={styleOf.modalContentRatingsColTitle}>Outlets</FontText>
                        <FontText numberOfLines={1} style={[
                          styleOf.modalContentRatingsColDesc
                        ]}>
                          {selectedFeature['ACCESSIBLE OUTLETS']}
                        </FontText>
                      </View>
                    </View>
                  </View>
                  <View style={styleOf.modalContentRatingsRow}>
                    <View style={styleOf.modalContentRatingsCols}>
                      <Image source={require('../assets/table-green-icon.png')} style={styleOf.modalContentRatingsImage} />
                      <View style={{ flexDirection: 'column' }}>
                        <FontText style={styleOf.modalContentRatingsColTitle}>Seating</FontText>
                        <FontText numberOfLines={1} style={styleOf.modalContentRatingsColDesc}>{selectedFeature['TYPES OF SEATING']}</FontText>
                      </View>
                    </View>
                    <View style={styleOf.modalContentRatingsCols}>
                      <Image source={Icons.noise[selectedFeature['BACKGROUND NOISE']]} style={styleOf.modalContentRatingsImage} />
                      <View style={{ flexDirection: 'column' }}>
                        <FontText style={styleOf.modalContentRatingsColTitle}>Noise level</FontText>
                        <FontText numberOfLines={1} style={[
                          styleOf.modalContentRatingsColDesc
                        ]}>
                          {selectedFeature['BACKGROUND NOISE']}
                        </FontText>
                      </View>
                    </View>
                  </View>
                </View>

                {(selAdditionals.length != 0) && (
                  <View style={styleOf.modalContentAdditionalSection}>
                    <View style={styleOf.modalContentAdditionalItem}>
                      <Image source={selAdditionals[0]['value'] ? require('../assets/additional_check.png') : require('../assets/additional_cancel.png')} style={{ width: 14, height: 14, marginRight: 10, }} />
                      <FontText style={styleOf.modalContentAdditionalText}>
                        {selAdditionals[0]['key'] == '-' ? 'Public' : selAdditionals[0]['key']}
                      </FontText>
                    </View>
                    <View style={styleOf.modalContentAdditionalItem}>
                      <Image source={selAdditionals[1]['value'] ? require('../assets/additional_check.png') : require('../assets/additional_cancel.png')} style={{ width: 14, height: 14, marginRight: 10, }} />
                      <FontText style={styleOf.modalContentAdditionalText}>
                        {selAdditionals[1]['key']}
                      </FontText>
                    </View>
                    <View style={styleOf.modalContentAdditionalItem}>
                      <Image source={selAdditionals[2]['value'] ? require('../assets/additional_check.png') : require('../assets/additional_cancel.png')} style={{ width: 14, height: 14, marginRight: 10, }} />
                      <FontText style={styleOf.modalContentAdditionalText}>
                        {selAdditionals[2]['key']}
                      </FontText>
                    </View>
                  </View>
                )}
                {(selAdditionals.length != 0) && (
                  <View style={styleOf.modalContentAdditionalSection}>
                    <View style={styleOf.modalContentAdditionalItem}>
                      <Image source={selAdditionals[3]['value'] ? require('../assets/additional_check.png') : require('../assets/additional_cancel.png')} style={{ width: 14, height: 14, marginRight: 10, }} />
                      <FontText style={styleOf.modalContentAdditionalText}>
                        {selAdditionals[3]['key']}
                      </FontText>
                    </View>
                    <View style={styleOf.modalContentAdditionalItem}>
                      <Image source={selAdditionals[4]['value'] ? require('../assets/additional_check.png') : require('../assets/additional_cancel.png')} style={{ width: 14, height: 14, marginRight: 10, }} />
                      <FontText style={styleOf.modalContentAdditionalText}>
                        {selAdditionals[4]['key']}
                      </FontText>
                    </View>
                  </View>
                )}
                {(selAdditionals.length != 0) && (
                  <View style={styleOf.modalContentAdditionalSection}>
                    <View style={styleOf.modalContentAdditionalItem}>
                      <Image source={selAdditionals[5]['value'] ? require('../assets/additional_check.png') : require('../assets/additional_cancel.png')} style={{ width: 14, height: 14, marginRight: 10, }} />
                      <FontText style={styleOf.modalContentAdditionalText}>
                        {selAdditionals[5]['key']}
                      </FontText>
                    </View>
                    <View style={styleOf.modalContentAdditionalItem}>
                      <Image source={selAdditionals[6]['value'] ? require('../assets/additional_check.png') : require('../assets/additional_cancel.png')} style={{ width: 14, height: 14, marginRight: 10, }} />
                      <FontText style={styleOf.modalContentAdditionalText}>
                        {selAdditionals[6]['key']}
                      </FontText>
                    </View>
                  </View>
                )}

                <View style={styleOf.modalContentWifiSection}>
                  <View style={styleOf.modalContentWifiIcon}>
                    <Image source={require('../assets/wifi-icon.png')} style={{ width: 20, height: 20, marginRight: 8, resizeMode: 'contain' }} />
                    <FontText style={{ color: '#11142D', fontSize: 14, lineHeight: 18, fontWeight: '400' }}>Access Point</FontText>
                  </View>
                  <View style={styleOf.modalContentWifiAddress}>
                    <View style={{ flexDirection: 'column', justifyContent: 'flex-start', marginRight: 20 }}>
                      <FontText style={{ color: '#808191', fontSize: 12, lineHeight: 16, fontWeight: '400' }}>Wifi name</FontText>
                      <TouchableOpacity onPress={copyNameToClipboard}>
                        <FontText style={{ color: '#11142D', fontSize: 13, fontWeight: '400', lineHeight: 16 }}>{selectedFeature['WIFI USERNAME']}</FontText>
                      </TouchableOpacity>
                    </View>
                    <View style={{ flexDirection: 'column', justifyContent: 'flex-start', marginLeft: 20 }}>
                      <FontText style={{ color: '#808191', fontSize: 12, lineHeight: 16, fontWeight: '400' }}>Password</FontText>
                      <TouchableOpacity onPress={copyPasswordToClipboard}>
                        <FontText style={{ color: '#11142D', fontSize: 13, fontWeight: '400', lineHeight: 16 }}>{selectedFeature['WIFI PASSWORD']}</FontText>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                      style={{ marginLeft: 20, width: 90, backgroundColor: '#11142D', borderRadius: 8 }}
                      onPress={() => copyPasswordToClipboard()}
                    >
                      <FontText style={{ color: '#FFF', fontSize: 13, fontWeight: '400', lineHeight: 16, alignSelf: 'center', paddingVertical: 8 }}>Copy</FontText>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

            </View>
          )}

        </View>
        <Toast ref={(ref) => { modalToast = ref; }} style={styleOf.modalToast} textStyle={{ color: 'white' }} positionValue={185} />
      </Modal>
    </View>
  );
}

const styleOf = StyleSheet.create({
  container: {
    // flex: 1,
    // zIndex: 1
  },
  modal: {
    flex: 1,
    margin: 0,
    // padding: 10,
  },
  modalWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContentWrapper: {
    backgroundColor: 'white',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    width: width,
    height: modalHeight,
    // padding: 16,
    alignSelf: 'center',
    alignItems: 'center',
  },
  modalContentImageSection: {
    marginBottom: 10,
    flexDirection: 'row',
    flex: 3.5,
    alignSelf: 'center',
    position: 'relative'
  },
  modalBackButton: {
    top: 20,
    left: 20,
    position: 'absolute',
    zIndex: 2
  },
  modalContentImage: {
    resizeMode: 'cover',
    flex: 1,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: '#d3d3d3',
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalContentTitleSection: {
    marginBottom: 25,
  },
  modalContentTitle: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  modalContentTitleRateOpenTime: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6
  },
  modalContentTitleRate: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  modalContentRatingsSection: {
    marginBottom: 17
  },
  modalDividerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalDivider: {
    flex: 1,
    borderBottomWidth: 1,
    borderColor: '#F0F2FE',
  },
  modalContentRatingsRow: {
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContentRatingsCols: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'baseline',
    marginRight: 10,
    flex: 1,
    alignItems: 'center',
  },
  modalContentRatingsImage: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  modalContentRatingsColTitle: {
    color: '#808191',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  modalContentRatingsColDesc: {
    color: '#11142D',
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 16,
    maxWidth: (width - 150) / 2,
  },
  modalContentAdditionalSection: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 6
  },
  modalContentAdditionalItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  modalContentAdditionalText: {
    color: '#11142D',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400'
  },
  modalContentWifiSection: {
    marginTop: 15,
    marginBottom: 10,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start'
  },
  modalContentWifiIcon: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 12
  },
  modalContentWifiAddress: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F3F6',
    borderRadius: 12,
    width: '100%',
    paddingVertical: 5,
    paddingHorizontal: 20
  },
  modalToast: {
    paddingVertical: 15,
    paddingHorizontal: 25,
    backgroundColor: '#0026517d',
    borderRadius: 16,
  },
  cardContainer: {
    position: 'absolute',
    zIndex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
    bottom: -220
  },
  cardContainerNormal: {
    position: 'absolute',
    zIndex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
    bottom: 20
  },
  cardList: {
    // height: 200,
    // backgroundColor: 'transparent'
  },
  cardItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    height: 310,
    width: (width - 80),
    borderRadius: 16,
    backgroundColor: 'white',
    marginHorizontal: 10
  },
  cardContentTitleSection: {
    marginBottom: 30,
  },
  cardContentTitle: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardContentTitleRateOpenTime: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6
  },
  cardContentTitleRate: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  cardContentRatingsSection: {
    marginBottom: 20
  },
  cardDividerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardDivider: {
    flex: 1,
    borderBottomWidth: 1,
    borderColor: '#F0F2FE',
  },
  cardContentRatingsRow: {
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContentRatingsCols: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'baseline',
    marginRight: 10,
    flex: 1,
    alignItems: 'center',
  },
  cardContentRatingsImage: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  cardContentRatingsColTitle: {
    color: '#808191',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  cardContentRatingsColDesc: {
    color: '#11142D',
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 16,
    maxWidth: (width - 200) / 2,
  },
  cardContentAdditionalSection: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 6
  },
  cardContentAdditionalItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  cardContentAdditionalText: {
    color: '#11142D',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400'
  }
});
