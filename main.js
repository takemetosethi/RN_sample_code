import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  Platform,
  FlatList,
  KeyboardAvoidingView,
  TextInput,
  View,
  Dimensions,
  Modal,
  Image,
  AsyncStorage,
  ImageBackground,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import Header from '../components/Header';
import Icon from 'react-native-vector-icons/dist/MaterialCommunityIcons';
import Icon1 from 'react-native-vector-icons/dist/Ionicons';
import Icon2 from 'react-native-vector-icons/dist/SimpleLineIcons';
import SectionedMultiSelect from 'react-native-sectioned-multi-select';
import LinearGradient from 'react-native-linear-gradient';
import Toast from 'react-native-simple-toast';
HTTPSERVICE = require('../services/httpService');
import {SafeAreaView} from 'react-navigation';
const DEVICE_WIDTH = Dimensions.get('window').width;
const DEVICE_HEIGHT = Dimensions.get('screen').height;

export default class Main extends React.Component {
  static navigationOptions = {
    header: null,
  };
  constructor(props) {
    super(props);
  }
  state = {
    isSearch: false,
    Restaurants: [],
    showAreas: false,
    currentCityId: 1,
    Cities: [],
    AreasByCity: [],
    selectedCity: [],
    selectedArea: [],
    restaurantName: '',
  };
  componentDidMount() {
    this.fetchRestaurants();
    this.fetchCities();
    AsyncStorage.getItem('Restaurant').then((restaurant) => {
      this.restaurant = JSON.parse(restaurant);
      this.setState({restaurantName: this.restaurant.CustomerIDString});
    });
  }
  fetchRestaurants() {
    HTTPSERVICE.getRequest('customer/CityandArea/2/5', '').then((response) => {
      if (response.data) {
        this.setState({Restaurants: response.data});
      } else {
      }
    });
  }
  fetchCities() {
    HTTPSERVICE.getRequest('customer/GetCity', '').then((response) => {
      if (response.data) {
        var cities = [];
        response.data.map((city) => {
          var cityObj = {id: city.Id, name: city.Name};
          cities.push(cityObj);
        });
        this.setState({Cities: cities});
      } else {
      }
    });
  }
  fetchAreasByCities(id) {
    HTTPSERVICE.getRequest('customer/GetAreabyCity/' + id, '').then(
      (response) => {
        if (response.data) {
          var areas = [];
          response.data.map((area) => {
            var areaObj = {id: area.Id, name: area.Name};
            areas.push(areaObj);
          });
          this.setState({
            AreasByCity: areas,
            showAreas: this.state.isSearch ? false : true,
            currentCityId: id,
          });
        } else {
        }
      },
    );
  }
  goToRestaurants(city, area) {
    if (city && area)
      this.setState({showAreas: false, isSearch: false}, () => {
        this.props.navigation.navigate('Restaurants', {
          navigation: this.props.navigation,
          cityId: city,
          areaId: area,
          restaurantName: this.state.restaurantName,
        });
      });
  }
  goToOrderDetails() {
    if (this.state.restaurantName) {
      this.props.navigation.navigate('OrderDetails');
    } else {
      Toast.show('Cart is empty');
    }
  }
  renderAreas() {
    return this.state.AreasByCity.map((area) => {
      return (
        <View
          style={{
            borderRadius: 20,
            borderWidth: 1,
            borderColor: '#000000',
            marginBottom: 10,
          }}>
          <TouchableOpacity
            onPress={() =>
              this.goToRestaurants(this.state.currentCityId, area.id)
            }>
            <Text
              style={{
                paddingHorizontal: 15,
                paddingVertical: 5,
                textAlign: 'center',
              }}>
              {area.name}
            </Text>
          </TouchableOpacity>
        </View>
      );
    });
  }
  renderCityAreas() {
    return (
      <Modal
        style={{margin: 0}}
        visible={this.state.showAreas}
        transparent={true}
        onRequestClose={() => this.setState({showAreas: false})}
        onBackdropPress={() => this.setState({showAreas: false})}>
        <View
          style={{
            backgroundColor: 'rgba(0,0,0,0.6)',
            height: '100%',
            flexDirection: 'row',
          }}>
          <LinearGradient
            style={{
              marginTop: '25%',
              marginHorizontal: '5%',
              borderRadius: 10,
              height: '30%',
              flex: 1,
            }}
            colors={['rgba(255,255,255,1)', 'rgba(219,170,86,1)']}>
            <View style={{alignItems: 'center'}}>
              <View style={{paddingHorizontal: '10%', paddingVertical: '5%'}}>
                <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                  <Icon1 name="md-map" size={20} />
                  <Text
                    style={{
                      textAlign: 'center',
                      fontWeight: '700',
                      fontSize: 16,
                      marginLeft: 10,
                    }}>
                    CHOOSE YOUR AREA
                  </Text>
                </View>
                <View
                  style={{
                    height: '45%',
                    flexDirection: 'row',
                    marginTop: 20,
                    marginBottom: 10,
                    width: '100%',
                    flexWrap: 'wrap',
                    justifyContent: 'space-evenly',
                  }}>
                  {this.renderAreas()}
                </View>
              </View>
              <View
                style={{height: 1, width: '100%', backgroundColor: 'white'}}
              />
              <TouchableOpacity
                onPress={() => this.setState({showAreas: false})}
                style={{
                  alignItems: 'center',
                  flexDirection: 'row',
                  flex: 1,
                  // paddingVertical: 20,
                  height: '5%',
                }}>
                <Icon1 name="md-close" size={30} />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </Modal>
    );
  }
  OpenSearch = () => {
    this.setState({isSearch: true});
  };
  onSelectedItemsChange(item, index) {
    if (index === '1') {
      this.fetchAreasByCities(item[0]);
      this.setState({selectedCity: item, City: item[0]});
    } else if (index === '2') {
      this.setState({selectedArea: item, Area: item[0]});
    }
  }
  renderSearchModal() {
    return (
      <Modal
        style={{margin: 0}}
        visible={this.state.isSearch}
        transparent={true}
        onRequestClose={() => this.setState({isSearch: false})}
        onBackdropPress={() => this.setState({isSearch: false})}>
        <LinearGradient
          colors={['rgba(255,255,255,0.9)', 'rgba(219,170,86,0.9)']}
          style={{
            flex: 1,
            height: DEVICE_HEIGHT,
            marginTop: Platform.OS === 'ios' ? 44 : 0,
          }}>
          <View style={{flex: 1}}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <TouchableOpacity
                style={{left: 0}}
                onPress={() => this.setState({isSearch: false})}>
                <ImageBackground
                  source={require('../assets/HeaderLeftBlack.png')}
                  resizeMode="contain"
                  style={{
                    height: 70,
                    width: 70,
                    alignSelf: 'flex-start',
                    justifyContent: 'center',
                  }}>
                  <Icon2
                    name="arrow-left"
                    size={20}
                    color="#fff"
                    style={{marginLeft: 25}}
                  />
                </ImageBackground>
              </TouchableOpacity>
              <Text
                style={{
                  flex: 1,
                  fontSize: 28,
                  textAlign: 'center',
                  marginRight: '10%',
                  alignSelf: 'center',
                }}>
                SEARCH
              </Text>
            </View>
            <View style={{marginTop: '10%', marginHorizontal: 20}}>
              <TextInput
                onChangeText={(text) => this.setState({restaurantName: text})}
                value={this.state.restaurantName}
                placeholder={'Restaurant Name'}
                placeholderTextColor="black"
                style={{
                  fontSize: 20,
                  marginBottom: 20,
                  paddingHorizontal: 15,
                  paddingVertical: 15,
                  backgroundColor: 'white',
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: '#ca9b47',
                }}
              />
              <View
                style={{
                  backgroundColor: 'white',
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: '#ca9b47',
                  paddingHorizontal: 15,
                  paddingVertical: 15,
                  marginBottom: 20,
                }}>
                <SectionedMultiSelect
                  single={true}
                  items={this.state.Cities}
                  uniqueKey="id"
                  selectText="Select city"
                  showDropDowns={true}
                  modalWithTouchable={true}
                  hideSearch={true}
                  modalWithSafeAreaView={true}
                  hideConfirm={true}
                  styles={{
                    container: {
                      flex: 0,
                      flexDirection: 'row',
                      alignContent: 'center',
                      flexWrap: 'wrap',
                    },
                    itemText: {
                      fontWeight: 'normal',
                      fontSize: 16,
                      color: '#ca9b47',
                    },
                    modalWrapper: {
                      justifyContent: 'center',
                    },
                    selectToggle: {
                      paddingHorizontal: 0,
                    },
                  }}
                  onSelectedItemsChange={(item) =>
                    this.onSelectedItemsChange(item, '1')
                  }
                  selectedItems={this.state.selectedCity}
                />
              </View>
              <View
                style={{
                  backgroundColor: 'white',
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: '#ca9b47',
                  paddingHorizontal: 15,
                  paddingVertical: 15,
                  marginBottom: 20,
                }}>
                <SectionedMultiSelect
                  single={true}
                  items={this.state.AreasByCity}
                  uniqueKey="id"
                  selectText="Select Area"
                  showDropDowns={true}
                  modalWithTouchable={true}
                  hideSearch={true}
                  modalWithSafeAreaView={true}
                  hideConfirm={true}
                  styles={{
                    container: {
                      flex: 0,
                      flexDirection: 'row',
                      alignContent: 'center',
                      flexWrap: 'wrap',
                    },
                    itemText: {
                      fontWeight: 'normal',
                      fontSize: 16,
                      color: '#ca9b47',
                    },
                    modalWrapper: {
                      justifyContent: 'center',
                    },
                    selectToggle: {
                      paddingHorizontal: 0,
                    },
                  }}
                  onSelectedItemsChange={(item) =>
                    this.onSelectedItemsChange(item, '2')
                  }
                  selectedItems={this.state.selectedArea}
                />
              </View>
              <View>
                <TouchableOpacity
                  onPress={() =>
                    this.goToRestaurants(
                      this.state.selectedCity[0],
                      this.state.selectedArea[0],
                    )
                  }
                  style={{
                    flexDirection: 'row',
                    alignSelf: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#000000',
                    borderRadius: 40,
                    paddingVertical: 15,
                    paddingHorizontal: 20,
                    width: DEVICE_WIDTH / 2,
                  }}>
                  <Icon1
                    name="ios-search"
                    size={30}
                    color="#fff"
                    style={{marginLeft: 20, marginRight: 10}}
                  />
                  <Text
                    style={{fontSize: 20, color: '#ffffff', marginRight: 30}}>
                    Search
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </LinearGradient>
      </Modal>
    );
  }
  renderCities = ({item}) => {
    return (
      <TouchableWithoutFeedback
        onPress={() => this.fetchAreasByCities(item.id)}>
        <View>
          <Image
            resizeMode="contain"
            style={{
              marginRight: 15,
              height: DEVICE_WIDTH / 3,
              width: DEVICE_WIDTH / 2.5,
              borderRadius: 10,
            }}
            source={require('../assets/image1.jpg')}
          />
          <Text style={{color: 'black', textAlign: 'center', fontSize: 14}}>
            {item.name}
          </Text>
        </View>
      </TouchableWithoutFeedback>
    );
  };
  navigateToRestaurantDetails(restaurant) {
    AsyncStorage.setItem('Restaurant', JSON.stringify(restaurant), () => {
      this.props.navigation.navigate('RestaurantDetails');
    });
  }
  renderRestaurant = ({item}) => {
    return (
      <TouchableWithoutFeedback
        onPress={() => this.navigateToRestaurantDetails(item)}>
        <View style={{elevation: 10}}>
          <ImageBackground
            resizeMode="contain"
            imageStyle={{borderRadius: 10}}
            style={{
              marginRight: 15,
              paddingHorizontal: 10,
              paddingVertical: 20,
              alignItems: 'flex-start',
              justifyContent: 'flex-end',
              height: DEVICE_WIDTH / 1.5,
              width: DEVICE_WIDTH / 1.5,
            }}
            source={
              item.CustomerTheme.CompanyLogoUrl
                ? {uri: item.CustomerTheme.CompanyLogoUrl}
                : require('../assets/image1.jpg')
            }>
            <Text style={{color: 'white', textAlign: 'left', fontSize: 20}}>
              {item.CustomerName}
            </Text>
          </ImageBackground>
        </View>
      </TouchableWithoutFeedback>
    );
  };
  render() {
    return (
      <SafeAreaView style={styling.mainContainer}>
        {this.state.isSearch ? this.renderSearchModal() : null}
        {this.renderCityAreas()}
        <Header
          isSearch={true}
          isLogo={true}
          OpenSearch={this.OpenSearch}
          navigation={this.props.navigation}
          ref="child"
          {...this.props}
        />
        <ScrollView showsVerticalScrollIndicator={false}>
          <LinearGradient
            colors={['#ececec', '#ffffff', '#ffffff']}
            style={{flex: 1}}>
            <View style={{flex: 1}}>
              <View
                style={{
                  alignContent: 'flex-start',
                  justifyContent: 'flex-start',
                  marginHorizontal: 20,
                  marginVertical: 20,
                }}>
                <Text style={{color: '#ca9b47', fontSize: 18}}>
                  Looking for
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <Text style={{fontSize: 20}}>Your favorite restaurant </Text>
                  <TouchableOpacity
                    style={{flexDirection: 'row', alignItems: 'center'}}
                    onPress={() =>
                      this.props.navigation.navigate('Restaurants', {
                        navigation: this.props.navigation,
                        cityId: 2,
                        areaId: 5,
                      })
                    }>
                    <Text style={{fontSize: 12}}>View all</Text>
                    <Image
                      source={require('../assets/viewall.png')}
                      style={{height: 10, width: 10, marginLeft: 5}}
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={{flexDirection: 'row'}}>
                <FlatList
                  horizontal={true}
                  contentContainerStyle={{padding: 20}}
                  data={this.state.Restaurants}
                  renderItem={this.renderRestaurant}
                  showsHorizontalScrollIndicator={false}
                />
              </View>
            </View>
            <View style={{flex: 1, marginTop: 50}}>
              <View
                style={{
                  alignContent: 'flex-start',
                  justifyContent: 'flex-start',
                  marginHorizontal: 20,
                  marginVertical: 20,
                }}>
                <Text style={{color: '#ca9b47', fontSize: 18}}>Search </Text>
                <Text style={{fontSize: 20}}>Restaurants by city </Text>
              </View>
              <View style={{flexDirection: 'row'}}>
                <FlatList
                  horizontal={true}
                  contentContainerStyle={{
                    padding: 25,
                    justifyContent: 'center',
                  }}
                  data={this.state.Cities}
                  renderItem={this.renderCities}
                  showsHorizontalScrollIndicator={false}
                />
              </View>
            </View>
          </LinearGradient>
        </ScrollView>
        <View
          style={{
            elevation: 20,
            backgroundColor: '#ca9b47',
            borderRadius: 20,
            height: 40,
            width: 40,
            position: 'absolute',
            bottom: Platform.OS === 'ios' ? 25 : 15,
            justifyContent: 'center',
            alignSelf: 'center',
            alignItems: 'center',
          }}>
          <TouchableOpacity onPress={() => this.goToOrderDetails()}>
            <Icon name="cart" size={25} color="#fff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
}
const styling = StyleSheet.create({
  seacherModal: {
    marginTop: Platform.OS === 'ios' ? 0 : 20,
    // paddingTop: 15,
    alignContent: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: '#ececec',
  },
  mainContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    position: 'relative',
    alignSelf: 'flex-start',
    height: '100%',
  },
});
