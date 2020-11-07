import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  TextInput,
  View,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  Image,
  AsyncStorage,
  ImageBackground,
  FlatList,
  Modal,
} from 'react-native';
import {CheckBox} from 'react-native-elements';
import {RadioButton} from 'react-native-paper';
import DatePicker from '../components/datepicker';
import HTMLView from 'react-native-htmlview';
import Header from '../components/Header';
import Icon from 'react-native-vector-icons/dist/MaterialCommunityIcons';
import Icon1 from 'react-native-vector-icons/dist/FontAwesome5';
import Icon2 from 'react-native-vector-icons/dist/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import SectionedMultiSelect from 'react-native-sectioned-multi-select';
import Toast from 'react-native-simple-toast';
import FloatingLabelInput from '../components/FloatingLabelInput';
import EventEmitter from 'react-native-eventemitter';
import Moment from 'moment';
HTTPSERVICE = require('../services/httpService');
const DEVICE_WIDTH = Dimensions.get('window').width;
const DEVICE_HEIGHT = Dimensions.get('window').height;

export default class OrderDetails extends React.Component {
  static navigationOptions = {
    header: null,
  };
  constructor(props) {
    super(props);
    AsyncStorage.getItem('Restaurant').then((restaurant) => {
      debugger;
      this.restaurant = JSON.parse(restaurant);
      this.restaurant.CustomerVTandC = this.restaurant.CustomerVTandC.replace(
        /<\/?[^>]+(>|$)/g,
        '',
      ).trim()
      if(!this.restaurant.CustomerVTandC){
        this.setState({isTnC: true})
      }
    });
  }
  componentDidMount() {
    this.props.navigation.addListener('didFocus', (payload) => {
      AsyncStorage.getItem('cart').then((cartValue) => {
        debugger
        if (cartValue) {
          var cart = [];
          cart = JSON.parse(cartValue);
          this.setState({cartItems: cart});
        }
      });

      var date = new Date();
      this.currentDay = date.getDay() + 1;
      this.fetchDeliverySlots();
      AsyncStorage.getItem('orderDetails').then((orderDetails) => {
        debugger
        if (orderDetails) {
          var details = JSON.parse(orderDetails);
          this.setState({
            fullName: details.name,
            phone: details.phone,
            email: details.email,
            addres_line_1: details.address1,
            addres_line_2: details.address2,
            postCode: details.code,
            deliveryArea: details.area,
            isReceiveInfo: details.info,
            isTnC: details.TnC,
            isLoading: false,
          });
        } else {
          this.setState({isLoading: false});
        }
      });
    });
  }
  state = {
    cartItems: [],
    fullName: '',
    phone: '',
    email: '',
    specialRequest: '',
    addres_line_1: '',
    addres_line_2: '',
    postCode: '',
    deliveryInstructions: '',
    deliveryMethod: 'Collected',
    deliveryArea: 'Helensburgh',
    isReceiveInfo: false,
    isTnC: false,
    selectedCollectionDate: '',
    selectedDeliveryDate: '',
    options: [
      {key: '1', icon: 'cart', name: 'ORDER TO BE COLLECTED', expanded: true},
      {
        key: '2',
        icon: 'home-circle',
        name: 'ORDER TO BE DELIVERED',
        expanded: false,
      },
    ],
    isCollected: true,
    isLoading: true,
    availableDeliverySlots: [],
    availableCollectionSlots: [],
    selectedDeliverySlot: [],
    selectedCollectionSlot: [],
  };
  fetchRestaurantDetails() {
    HTTPSERVICE.getRequest('customer/CityandArea/' + 2 + '/' + 5);
  }
  fetchDeliverySlots() {
    HTTPSERVICE.getRequest(
      'customer/GetOpenCloseTime/' +
        this.restaurant.CustomerIDString +
        '/' +
        this.currentDay,
    )
      .then((response) => {
        console.log(response);
        var slotsCollection =
          response.data.OpeningHours[0].SelectedCollectionTimes;
        var slotsDelivery = response.data.OpeningHours[0].SelectedDeliveryTimes;
        var deliverySlotsAsObject = [];
        var collectionSlotsAsObject = [];
        slotsCollection.map((map) => {
          var slotObject = {id: map, name: map};
          collectionSlotsAsObject.push(slotObject);
        });
        slotsDelivery.map((map) => {
          var slotObject = {id: map, name: map};
          deliverySlotsAsObject.push(slotObject);
        });
        this.setState({
          availableCollectionSlots: collectionSlotsAsObject,
          availableDeliverySlots: deliverySlotsAsObject,
          selectedDeliverySlot: [],
          selectedCollectionSlot: [],
        });
      })
      .catch((err) => {});
  }
  goToOrderSummary() {
    debugger;
    if (this.state.isTnC) {
      if (this.state.isCollected) {
        if (this.state.fullName && this.state.phone && this.state.email) {
          var orderDetails = {
            name: this.state.fullName,
            phone: this.state.phone,
            email: this.state.email,
            date: this.state.selectedCollectionDate,
            time: this.state.selectedCollectionSlot[0],
            orderDateTime: Moment(new Date()).format('YYYY-MM-DD HH:mm:ss A'),
            request: this.state.specialRequest,
            instructions: this.state.deliveryInstructions,
            info: this.state.isReceiveInfo,
            TnC: this.state.isTnC,
            deliveryMethod: 'Collected',
          };
        } else {
          Toast.show('Please fill all fields');
        }
      } else {
        if (
          this.state.fullName &&
          this.state.phone &&
          this.state.email &&
          (this.state.addres_line_1 || this.state.addres_line_2) &&
          this.state.postCode
        ) {
          var orderDetails = {
            name: this.state.fullName,
            phone: this.state.phone,
            email: this.state.email,
            request: this.state.specialRequest,
            address1: this.state.addres_line_1,
            address2: this.state.addres_line_2,
            code: this.state.postCode,
            instructions: this.state.deliveryInstructions,
            area: this.state.deliveryArea,
            date: this.state.selectedDeliveryDate,
            time: this.state.selectedDeliverySlot[0],
            orderDateTime: Moment(new Date()).format('YYYY-MM-DD HH:mm:ss A'),
            info: this.state.isReceiveInfo,
            TnC: this.state.isTnC,
            deliveryMethod: 'Delivery',
          };
        } else {
          Toast.show('Please fill all fields');
        }
      }
      if (orderDetails) {
        AsyncStorage.setItem('orderDetails', JSON.stringify(orderDetails)).then(
          () => {
            this.props.navigation.navigate('OrderSummary');
          },
        );
      }
    } else {
      Toast.show('Accept Terms & Conditions');
    }
  }
  toggleCheckbox(index) {
    if (index === '1') {
      this.setState({isReceiveInfo: !this.state.isReceiveInfo});
    } else {
      this.setState({isTnC: !this.state.isTnC});
    }
  }
  OnValueChange(index) {
    let role = [];
    var flag = false;
    if (index === 0) {
      flag = true;
    }
    this.state.options.map((o, i) => {
      i === index ? (o.expanded = true) : (o.expanded = false);
      role.push(o);
    });
    this.setState({
      role: role,
      isCollected: flag,
    });
  }
  onSelectedItemsChange(item, index) {
    if (index === '1') this.setState({selectedCollectionSlot: item});
    else if (index === '2') this.setState({selectedDeliverySlot: item});
  }
  onTextChange(value, index) {
    if (index === '1') {
      this.setState({fullName: value});
    } else if (index === '2') {
      this.setState({phone: value});
    } else if (index === '3') {
      this.setState({email: value});
    } else if (index === '4') {
      this.setState({specialRequest: value});
    } else if (index === '5') {
      this.setState({addres_line_1: value});
    } else if (index === '6') {
      this.setState({addres_line_2: value});
    } else if (index === '7') {
      this.setState({postCode: value});
    } else if (index === '8') {
      this.setState({deliveryInstructions: value});
    }
  }
  onSelectArea(area) {
    this.setState({deliveryArea: area});
  }
  validateDateTime(value, index) {
    if (value >= Moment(new Date()).format('YYYY-MM-DD')) {
      if (index === '1') {
        this.setState({selectedCollectionDate: value});
      } else if (index === '2') {
        this.setState({selectedDeliveryDate: value});
      }
      var date = new Date(value);
      this.currentDay = date.getDay() + 1;
      this.fetchDeliverySlots();
    } else {
      alert('Please select a valid date');
    }
  }
  renderOrderOptions() {
    let OptionItems = this.state.options.map((o, i) => {
      return (
        <TouchableOpacity
          pressDuration={0.1}
          style={{
            backgroundColor: o.expanded ? '#ececec' : '#ffffff',
            borderLeftColor: '#ffffff',
            borderLeftWidth: 2,
            flex: 1,
            paddingTop: 2,
          }}
          onPress={(v) => this.OnValueChange(i)}>
          <Icon
            name={o.icon}
            size={20}
            color="#ca9b47"
            style={{alignSelf: 'center'}}
          />
          <Text
            style={{
              textAlign: 'center',
              fontSize: 12,
              paddingBottom: 10,
              paddingHorizontal: 10,
            }}>
            {o.name}
          </Text>
          {o.expanded ? (
            <View
              style={{backgroundColor: '#ca9b47', height: 2, width: '100%'}}
            />
          ) : null}
        </TouchableOpacity>
      );
    });
    return (
      <View
        style={{
          justifyContent: 'space-between',
          flexDirection: 'row',
          margin: 20,
        }}>
        {OptionItems}
      </View>
    );
  }

  spliceCart(index) {
    var cart = this.state.cartItems;
    cart.map((item, i) => {
      if (i === index) {
        cart.splice(i, 1);
      }
    });
    EventEmitter.emit('cartQuantity', cart.length);
    AsyncStorage.setItem('cart', JSON.stringify(cart));
    this.setState({cartItems: cart});
  }
  renderOrderTotal() {
    var totalAmount = 0;
    if (this.state.cartItems.length > 0) {
      this.state.cartItems.map((item) => {
        totalAmount += item.Value * item.Person;
      });
      return (
        <Text
          style={{
            color: '#ca9b47',
            fontSize: 20,
            flex: 1,
            paddingVertical: 10,
            textAlign: 'center',
          }}>
          Order Total : £ {totalAmount.toFixed(2)}
        </Text>
      );
    } else {
      return (
        <Text
          style={{
            color: '#ca9b47',
            fontSize: 24,
            flex: 1,
            paddingVertical: 10,
            textAlign: 'center',
          }}>
          Your cart is empty.
        </Text>
      );
    }
  }
  renderCartItems() {
    if (this.state.cartItems && this.state.cartItems.length > 0) {
      return this.state.cartItems.map((item, i) => {
        return (
          <View>
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingHorizontal: 10,
                paddingVertical: 15,
              }}>
              <View
                style={{
                  flexDirection: 'column',
                  width: '50%',
                  justifyContent: 'center',
                }}>
                <View style={{flexDirection: 'row'}}>
                  <View
                    style={{
                      flexDirection: 'row',
                      backgroundColor: '#000000',
                      paddingVertical: 1,
                      paddingHorizontal: 5,
                      borderRadius: 20,
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginRight: 5,
                    }}>
                    <Icon
                      name="food"
                      size={15}
                      color="#ffffff"
                      style={{alignSelf: 'center'}}
                    />
                    <Text style={{color: '#ffffff', fontSize: 12}}>
                      {item.VoucherCategory}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      backgroundColor: 'red',
                      paddingVertical: 1,
                      paddingHorizontal: 5,
                      borderRadius: 20,
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <Icon2
                      name="people-outline"
                      size={15}
                      color="#ffffff"
                      style={{alignSelf: 'center'}}
                    />
                    <Text style={{color: '#ffffff', fontSize: 12}}>
                      {item.Person}
                    </Text>
                  </View>
                </View>
                <Text style={{fontSize: 12}}>{item.VoucherName}</Text>
              </View>
              <View style={{flexDirection: 'row', width: '50%'}}>
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 16,
                    width: '40%',
                    alignSelf: 'center',
                    flex: 1,
                  }}>
                  £ {item.Value}
                </Text>
                <TouchableOpacity
                  style={{
                    width: '60%',
                    alignSelf: 'center',
                    flex: 1,
                    paddingLeft: '10%',
                  }}
                  onPress={() => this.spliceCart(i)}>
                  <Icon name="close-box-outline" size={20} color="red" />
                </TouchableOpacity>
              </View>
            </View>
            <View
              style={{
                height: 1,
                width: '100%',
                flex: 1,
                backgroundColor: '#ececec',
              }}
            />
          </View>
        );
      });
    } else {
      return <View style={{flex: 0}}></View>;
    }
  }

  render() {
    return (
      <View style={styling.mainContainer}>
        <Header
          restaurant={this.restaurant}
          isLogo={false}
          title={'TAKEAWAY ORDER'}
          titleSize={20}
          OpenSearch={this.OpenSearch}
          navigation={this.props.navigation}
          ref="child"
          {...this.props}
        />
        {this.state.isLoading ? (
          <ActivityIndicator
            style={{flex: 1, alignSelf: 'center', justifyContent: 'center'}}
            size={50}
            animating={true}
            color="#ca9b47"
          />
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{paddingBottom: 50}}>
            {/* <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, }}> */}
            <LinearGradient colors={['#ececec', '#ffffff', '#ffffff']}>
              <View
                style={{
                  marginHorizontal: 20,
                  elevation: 10,
                  backgroundColor: 'white',
                  flex: 1,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingHorizontal: 10,
                    paddingVertical: 20,
                    flex: 1,
                  }}>
                  <View style={{flexDirection: 'row', width: '50%'}}>
                    <Icon
                      name="format-list-bulleted-type"
                      size={15}
                      color="#ca9b47"
                      style={{marginRight: 5, alignSelf: 'center'}}
                    />
                    <Text style={{color: '#ca9b47', fontSize: 14}}>ITEM</Text>
                  </View>
                  <View style={{flexDirection: 'row', width: '50%'}}>
                    <View style={{flexDirection: 'row'}}>
                      <Icon
                        name="tag"
                        size={15}
                        color="#ca9b47"
                        style={{marginRight: 5, alignSelf: 'center'}}
                      />
                      <Text style={{color: '#ca9b47', fontSize: 14}}>
                        PRICE
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        width: '50%',
                        flex: 1,
                        justifyContent: 'flex-end',
                      }}>
                      <Icon
                        name="close-box"
                        size={15}
                        color="#ca9b47"
                        style={{marginRight: 5, alignSelf: 'center'}}
                      />
                      <Text style={{color: '#ca9b47', fontSize: 14}}>
                        REMOVE
                      </Text>
                    </View>
                  </View>
                </View>
                <View
                  style={{height: 1, flex: 1, backgroundColor: '#ececec'}}
                />
                {this.renderCartItems()}
                {this.renderOrderTotal()}
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginHorizontal: 20,
                  marginVertical: 20,
                }}>
                <Text
                  style={{
                    paddingHorizontal: 20,
                    textAlign: 'center',
                    fontSize: 20,
                  }}>
                  <Text style={{fontWeight: '700'}}>Please Note : </Text>
                  <Text style={{fontSize: 20}}>
                    Delivery Fees will apply for Home Delivery
                  </Text>
                </Text>
              </View>
              <View style={{flexDirection: 'row', marginHorizontal: 20}}>
                <Icon1
                  name="user-edit"
                  size={30}
                  color="#ca9b47"
                  style={{marginRight: 10}}
                />
                <Text style={{fontSize: 20, alignSelf: 'flex-end'}}>
                  YOUR DETAILS{' '}
                </Text>
              </View>
              <View style={{marginHorizontal: 20}}>
                <FloatingLabelInput
                  icon="md-contact"
                  label="Full Name (*Required)"
                  type="email"
                  value={this.state.fullName}
                  onChangeText={(value) => this.onTextChange(value, '1')}
                />
                <FloatingLabelInput
                  icon="md-call"
                  label="Contact Phone Number (*Required)"
                  type="email"
                  value={this.state.phone}
                  onChangeText={(value) => this.onTextChange(value, '2')}
                />
                <FloatingLabelInput
                  icon="md-mail"
                  label="Email Address (*Required)"
                  type="email"
                  value={this.state.email}
                  onChangeText={(value) => this.onTextChange(value, '3')}
                />
                <FloatingLabelInput
                  icon="md-create"
                  label="Please add any special requests."
                  type="email"
                  value={this.state.specialRequest}
                  onChangeText={(value) => this.onTextChange(value, '4')}
                />
                <View
                  style={{
                    flexDirection: 'row',
                    marginLeft: -20,
                    alignItems: 'center',
                  }}>
                  <CheckBox
                    iconType="ionicon"
                    containerStyle={{paddingTop: 0, marginTop: 0}}
                    checkedColor="#ca9b47"
                    uncheckedColor="black"
                    uncheckedIcon="ios-square-outline"
                    checkedIcon="md-checkmark"
                    onPress={() => this.toggleCheckbox('1')}
                    checked={this.state.isReceiveInfo}
                  />
                  <Text
                    style={{
                      marginLeft: -20,
                      maxWidth: '95%',
                      fontSize: 12,
                    }}>
                    I would like to receive occasional information on offers and
                    news at Rive Restaurant
                  </Text>
                </View>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  marginHorizontal: 20,
                  marginTop: 30,
                }}>
                <Icon
                  name="truck-delivery"
                  size={30}
                  color="#ca9b47"
                  style={{marginRight: 10}}
                />
                <Text style={{fontSize: 20, alignSelf: 'flex-end'}}>
                  DELIVERY <Text style={{fontSize: 10}}>(SELECT ANY ONE)</Text>
                </Text>
              </View>
              <View>{this.renderOrderOptions()}</View>
              {this.state.isCollected ? (
                <View>
                  <View style={{marginHorizontal: 20, flexDirection: 'row'}}>
                    <Icon
                      size={30}
                      color={
                        this.state.selectedCollectionDate
                          ? '#ca9b47'
                          : '#000000'
                      }
                      name="calendar-month-outline"
                      style={{alignSelf: 'center', marginRight: 10}}
                    />
                    <DatePicker
                      style={{
                        flex: 1,
                        width: '100%',
                      }}
                      placeholder="Select Collection Date"
                      date={this.state.selectedCollectionDate}
                      mode="date"
                      format="YYYY-MM-DD"
                      confirmBtnText="Confirm"
                      cancelBtnText="Cancel"
                      customStyles={{
                        dateInput: {
                          borderWidth: 0,
                          borderBottomWidth: 1,
                          borderBottomColor: this.state.selectedCollectionDate
                            ? '#ca9b47'
                            : '#000000',
                          alignItems: 'flex-start',
                          textTransform: 'capitalize',
                        },
                        placeholderText: {
                          fontSize: 14,
                          color: '#000000',
                          paddingBottom: 0,
                        },
                        dateText: {
                          fontSize: 14,
                          color: '#ca9b47',
                          paddingBottom: 0,
                        },
                        dateTouchBody: {
                          position: 'relative',
                          width: '100%',
                        },
                        // ... You can check the source to find the other keys.
                      }}
                      onDateChange={(date) => this.validateDateTime(date, '1')}
                    />
                  </View>
                  <View
                    style={{
                      marginHorizontal: 20,
                      flexDirection: 'row',
                      flex: 1,
                    }}>
                    <Icon
                      size={30}
                      color={
                        this.state.selectedCollectionSlot[0]
                          ? '#ca9b47'
                          : '#000000'
                      }
                      name="clock-outline"
                      style={{alignSelf: 'center', marginRight: 10}}
                    />
                    <View style={{flex: 1}}>
                      <SectionedMultiSelect
                        single={true}
                        items={this.state.availableCollectionSlots}
                        uniqueKey="id"
                        selectText={
                          this.state.availableCollectionSlots.length
                            ? 'Select Collection Time'
                            : 'No collection slots available'
                        }
                        showDropDowns={true}
                        modalWithTouchable={true}
                        hideSearch={true}
                        modalWithSafeAreaView={true}
                        hideConfirm={true}
                        styles={{
                          scrollView: {
                            borderColor: '#eee',
                            borderBottomWidth: 2,
                          },
                          container: {
                            flex: 0,
                            flexDirection: 'row',
                            alignContent: 'center',
                            flexWrap: 'wrap',
                          },
                          itemText: {
                            fontWeight: 'normal',
                            fontSize: 14,
                            color: '#ca9b47',
                          },
                          modalWrapper: {
                            justifyContent: 'center',
                          },
                          selectToggle: {
                            flex: 1,
                            borderBottomColor: this.state
                              .selectedCollectionSlot[0]
                              ? '#ca9b47'
                              : '#000000',
                            borderBottomWidth: 1,
                            marginVertical: 15,
                            paddingVertical: 3,
                            paddingHorizontal: 0,
                          },
                          selectToggleText: {
                            fontSize: 14,
                            color: this.state.selectedCollectionSlot[0]
                              ? '#ca9b47'
                              : '#000000',
                            paddingBottom: 3,
                          },
                          chipText: {
                            color: '#ca9b47',
                          },
                          chipContainer: {
                            backgroundColor: '#ca9b47',
                            borderWidth: 0,
                            marginTop: 3,
                          },
                        }}
                        onSelectedItemsChange={(item) =>
                          this.onSelectedItemsChange(item, '1')
                        }
                        selectedItems={this.state.selectedCollectionSlot}
                      />
                    </View>
                  </View>
                  <Text
                    style={{
                      textAlign: 'center',
                      fontSize: 12,
                      marginVertical: 30,
                      marginHorizontal: 40,
                    }}>
                    During busy periods, collection or delivery times may be
                    longer than requested.
                  </Text>
                </View>
              ) : (
                <View style={{marginHorizontal: 20}}>
                  <FloatingLabelInput
                    icon="account-card-details"
                    label="Address of Recipient Line 1"
                    type="email"
                    value={this.state.addres_line_1}
                    onChangeText={(value) => this.onTextChange(value, '5')}
                  />
                  <FloatingLabelInput
                    icon="account-card-details"
                    label="Address of Recipient Line 2"
                    type="email"
                    value={this.state.addres_line_2}
                    onChangeText={(value) => this.onTextChange(value, '6')}
                  />
                  <FloatingLabelInput
                    icon="ios-pin"
                    label="Post Code (*Required)"
                    type="email"
                    value={this.state.postCode}
                    onChangeText={(value) => this.onTextChange(value, '7')}
                  />
                  <FloatingLabelInput
                    icon="md-create"
                    label="Delivery Iinstructions"
                    type="email"
                    value={this.state.deliveryInstructions}
                    onChangeText={(value) => this.onTextChange(value, '8')}
                  />
                  <View>
                    <View style={{flexDirection: 'row'}}>
                      <Icon
                        size={30}
                        color={
                          this.state.selectedDeliveryDate
                            ? '#ca9b47'
                            : '#000000'
                        }
                        name="calendar-month-outline"
                        style={{alignSelf: 'center', marginRight: 10}}
                      />
                      <DatePicker
                        style={{
                          flex: 1,
                          width: '100%',
                        }}
                        placeholder="Select Delivery Date"
                        date={this.state.selectedDeliveryDate}
                        mode="date"
                        format="YYYY-MM-DD"
                        confirmBtnText="Confirm"
                        cancelBtnText="Cancel"
                        customStyles={{
                          dateInput: {
                            borderWidth: 0,
                            borderBottomWidth: 1,
                            borderBottomColor: this.state.selectedDeliveryDate
                              ? '#ca9b47'
                              : '#000000',
                            alignItems: 'flex-start',
                            textTransform: 'capitalize',
                          },
                          placeholderText: {
                            fontSize: 14,
                            color: '#000000',
                            paddingBottom: 0,
                          },
                          dateText: {
                            fontSize: 14,
                            color: '#ca9b47',
                            paddingBottom: 0,
                          },
                          dateTouchBody: {
                            position: 'relative',
                            width: '100%',
                          },
                          // ... You can check the source to find the other keys.
                        }}
                        onDateChange={(date) =>
                          this.validateDateTime(date, '2')
                        }
                      />
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        flex: 1,
                      }}>
                      <Icon
                        size={30}
                        color={
                          this.state.selectedDeliverySlot[0]
                            ? '#ca9b47'
                            : '#000000'
                        }
                        name="clock-outline"
                        style={{alignSelf: 'center', marginRight: 10}}
                      />
                      <View style={{flex: 1}}>
                        <SectionedMultiSelect
                          single={true}
                          items={this.state.availableDeliverySlots}
                          uniqueKey="id"
                          selectText={
                            this.state.availableDeliverySlots.length
                              ? 'Select Delivery Time'
                              : 'No delivery slots available'
                          }
                          showDropDowns={true}
                          modalWithTouchable={true}
                          hideSearch={true}
                          modalWithSafeAreaView={true}
                          hideConfirm={true}
                          styles={{
                            scrollView: {
                              borderColor: '#eee',
                              borderBottomWidth: 2,
                            },
                            container: {
                              flex: 0,
                              flexDirection: 'row',
                              alignContent: 'center',
                              flexWrap: 'wrap',
                            },
                            itemText: {
                              fontWeight: 'normal',
                              fontSize: 14,
                              color: '#ca9b47',
                            },
                            modalWrapper: {
                              justifyContent: 'center',
                            },
                            selectToggle: {
                              flex: 1,
                              borderBottomColor: this.state
                                .selectedDeliverySlot[0]
                                ? '#ca9b47'
                                : '#000000',
                              borderBottomWidth: 1,
                              marginVertical: 15,
                              paddingVertical: 3,
                              paddingHorizontal: 0,
                            },
                            selectToggleText: {
                              fontSize: 14,
                              color: this.state.selectedDeliverySlot[0]
                                ? '#ca9b47'
                                : '#000000',
                              paddingBottom: 3,
                            },
                            chipText: {
                              color: '#ca9b47',
                            },
                            chipContainer: {
                              backgroundColor: '#ca9b47',
                              borderWidth: 0,
                              marginTop: 3,
                            },
                          }}
                          onSelectedItemsChange={(item) =>
                            this.onSelectedItemsChange(item, '2')
                          }
                          selectedItems={this.state.selectedDeliverySlot}
                        />
                      </View>
                    </View>
                  </View>
                  <View style={{marginVertical: 20}}>
                    <Text style={{fontSize: 12}}>
                      Delivery Area (*Required)
                    </Text>
                    <RadioButton.Group
                      onValueChange={(value) => this.onSelectArea(value)}
                      value={this.state.deliveryArea}>
                      <View style={{flexDirection: 'row'}}>
                        <View
                          style={{flexDirection: 'row', alignItems: 'center'}}>
                          <RadioButton color="#ca9b47" value="Helensburgh" />
                          <Text>Helensburgh - £1.50</Text>
                        </View>
                        <View
                          style={{flexDirection: 'row', alignItems: 'center'}}>
                          <RadioButton color="#ca9b47" value="Cardross" />
                          <Text>Cardross - £2.50</Text>
                        </View>
                      </View>
                    </RadioButton.Group>
                  </View>
                </View>
              )}

              <View
                style={{
                  backgroundColor: '#ececec',
                  height: 1,
                  flex: 1,
                  marginHorizontal: 20,
                }}
              />
              <View
                style={{
                  flexDirection: 'row',
                  marginHorizontal: 20,
                  marginBottom: 50,
                }}>
                {this.restaurant.CustomerVTandC.trim() !== '' ? (
                  <View
                    style={{
                      flexDirection: 'row',
                      marginLeft: -20,
                      alignItems: 'flex-start',
                      marginTop: 20,
                    }}>
                    <CheckBox
                      iconType="ionicon"
                      checkedColor="#ca9b47"
                      uncheckedColor="black"
                      uncheckedIcon="ios-square-outline"
                      checkedIcon="md-checkmark"
                      containerStyle={{paddingTop: 0, marginTop: 0}}
                      onPress={() => this.toggleCheckbox('2')}
                      checked={this.state.isTnC}
                    />
                    <Text
                      style={{
                        marginLeft: -20,
                        maxWidth: '95%',
                        fontSize: 12,
                        textAlign: 'justify',
                      }}>
                      {this.restaurant
                        ? this.restaurant.CustomerVTandC.replace(/  +/g, '')
                        : ''}
                    </Text>
                  </View>
                ) : null}
              </View>
            </LinearGradient>
            {/* </KeyboardAvoidingView> */}
          </ScrollView>
        )}
        <View
          style={{
            paddingTop: Platform.OS === 'ios' ? 10 : 0,
            height: 60,
            width: '100%',
            backgroundColor: '#ffffff',
            elevation: 5,
            position: 'absolute',
            bottom: 0,
            justifyContent: 'center',
            alignContent: 'center',
          }}>
          <View
            style={{
              marginBottom: Platform.OS === 'ios' ? 20 : 0,
              justifyContent: 'center',
              alignItems: 'center',
              height: 40,
              backgroundColor: '#000000',
              borderRadius: 20,
              marginHorizontal: DEVICE_WIDTH / 4,
            }}>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => this.goToOrderSummary()}>
              <Text style={{color: '#ffffff', marginRight: 5}}>
                View Summary and Pay
              </Text>
              <Icon1 name="arrow-right" size={10} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
}
const htmlstyles = StyleSheet.create({
  b: {
    color: '#817889',
    fontSize: 13,
  },
});
const styling = StyleSheet.create({
  mainContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    backgroundColor: 'white',
    alignSelf: 'flex-start',
    height: '100%',
    width: '100%',
  },
  renderItemWrapper: {
    flexDirection: 'column',
    height: 'auto',
    borderStyle: 'solid',
    borderWidth: 4,
    borderColor: '#fff',
    width: '50%',
    alignItems: 'center',
  },
  rederItemImage: {
    width: '100%',
    height: 160,
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
  },
});
