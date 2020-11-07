import React from 'react';
import {
  FlatList,
  ScrollView,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Carousel, {Pagination} from 'react-native-snap-carousel';
import FastImage from 'react-native-fast-image';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import DynamicAppStyles from '../../DynamicAppStyles';
import styles from './styles';
import Hamburger from '../../components/Hamburger/Hamburger';
import {overrideCart, setCartVendor} from '../../Core/cart/redux/actions';
import {Appearance} from 'react-native-appearance';
import {firebase} from '../../Core/firebase/config';
import {IMLocalized} from '../../Core/localization/IMLocalization';
import AdminVendorListScreen from '../../Core/vendor/admin/ui/AdminVendorList/AdminVendorListScreen';
import IMVendorFilterModal from '../../components/FilterModal/FilterModal';
import { VENDOR, VENDOR_CATEGORIES } from '../../Configuration';
import {setVendors, setPopularProducts} from '../../Core/vendor/redux';
import ProductsAPIManager from '../../api/ProductsAPIManager';
import PopularProductsListView from './PopularProductsListView/PopularProductsListView';
import IMVendorListAPI from '../../Core/vendor/api/IMVendorListAPI';

const {width: viewportWidth} = Dimensions.get('window');

class HomeScreen extends React.Component {
  static navigationOptions = ({navigation, screenProps}) => ({
    title: IMLocalized('Home'),
    headerLeft: (
      <Hamburger
        onPress={() => {
          navigation.openDrawer();
        }}
      />
    ),
  });

  constructor(props) {
    super(props);
    const appConfig = props.navigation.state.params.appConfig;
    if (appConfig.isMultiVendorEnabled){
      this.vendorAPIManager = new IMVendorListAPI(props.setVendors, VENDOR);
    } else {
      this.productsAPIManager = new ProductsAPIManager(props.setPopularProducts);
    }

    this.COLOR_SCHEME = Appearance.getColorScheme();
    this.categoriesRef = 
      firebase
        .firestore()
        .collection(VENDOR_CATEGORIES)
        .orderBy('order');
    this.dealsRef =
      firebase
        .firestore()
        .collection(VENDOR_CATEGORIES)
        .orderBy('order');

    this.categorieUnsubscribe = null;
    this.dealsUnsubscribe = null;
    this.foodsUnsubscribe = null;

    this.state = {
      activeSlide: 0,
      categories: [],
      deals: [],
      foods: [],
      vendors: [],
      filters: {},
      index: 0,
      // loading: false,
      // error: null,
      // refreshing: false,
    };
  }

  componentDidMount() {
    this.initCartFromPersistentStore();
    this.categorieUnsubscribe = this.categoriesRef.onSnapshot(
      this.onCategoriesCollectionUpdate,
    );
    this.dealsUnsubscribe = this.dealsRef.onSnapshot(
      this.onDealsCollectionUpdate,
    );
  }

  navToMap(vendors, navigation) {
    if (vendors.length > 0 || vendors !== undefined) {
      navigation.navigate('Map', {vendors});
    }
  }

  componentWillUnmount() {
    this.categorieUnsubscribe && this.categorieUnsubscribe();
    this.dealsUnsubscribe && this.dealsUnsubscribe();
    this.vendorAPIManager?.unsubscribe && this.vendorAPIManager.unsubscribe();
    this.productsAPIManager?.unsubscribe && this.productsAPIManager.unsubscribe();
  }

  onPressCategoryItem = item => {
    const appConfig = this.props.navigation.state.params.appConfig;
    const appStyles = this.props.navigation.state.params.appStyles;
    if (appConfig.isMultiVendorEnabled) {
      this.props.navigation.navigate('Vendor', {
        category: item,
        appStyles,
        appConfig,
      });
    } else {
      this.props.navigation.navigate('SingleVendor', {category: item});
    }
  };

  onPressDealItem = item => {
    const appConfig = this.props.navigation.state.params.appConfig;
    const appStyles = this.props.navigation.state.params.appStyles;
    if (appConfig.isMultiVendorEnabled) {
      this.props.navigation.navigate('Vendor', {
        category: item,
        appStyles,
        appConfig,
      });
    } else {
      this.props.navigation.navigate('SingleVendor', {category: item});
    }
  };

  onCategoriesCollectionUpdate = querySnapshot => {
    this.setState({
      categories: querySnapshot.docs.map(doc => doc.data()),
    });
  };

  onDealsCollectionUpdate = querySnapshot => {
    this.setState({
      deals: querySnapshot.docs.map(doc => doc.data()),
      selectedItem: {},
      isVisible: false,
    });
  };

  initCartFromPersistentStore() {
    AsyncStorage.getItem('@MySuperCart:key')
      .then(res => {
        if (res != null) {
          const cart = JSON.parse(res)
          this.props.overrideCart(cart.cartItems);
          this.props.setCartVendor(cart.vendor)
        }
      })
      .catch(error => {
        console.log(`Promise is rejected with error: ${error}`);
      });
  }

  renderCategoryItem = ({item}) => (
    <TouchableOpacity onPress={() => this.onPressCategoryItem(item)}>
      <View style={styles.categoryItemContainer}>
        <FastImage
          placeholderColor={DynamicAppStyles.colorSet[this.COLOR_SCHEME].grey9}
          style={styles.categoryItemPhoto}
          source={{uri: item.photo}}
        />
        <Text style={styles.categoryItemTitle}>{item.title}</Text>
      </View>
    </TouchableOpacity>
  );

  renderDealItem = ({item}) => (
    <TouchableOpacity onPress={() => this.onPressDealItem(item)}>
      <View style={styles.dealItemContainer}>
        <FastImage
          placeholderColor={DynamicAppStyles.colorSet[this.COLOR_SCHEME].grey9}
          style={styles.dealPhoto}
          source={{uri: item.photo}}
        />
        <View style={styles.overlay} />
        <Text style={styles.dealName}>{item.title}</Text>
      </View>
    </TouchableOpacity>
  );

  renderCategorySeparator = () => {
    return (
      <View
        style={{
          width: 10,
          height: '100%',
        }}
      />
    );
  };

  render() {
    const {user} = this.props;

    if (user.isAdmin) {
      return <AdminVendorListScreen />;
    }

    const {activeSlide, filters, isVisible} = this.state;
    const appConfig = this.props.navigation.state.params.appConfig;

    return (
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}>
        <IMVendorFilterModal
          isVisible={isVisible}
          filters={filters}
          close={() => this.setState({isVisible: false})}
        />
        <Text style={styles.title}> {IMLocalized('Popular Categories')} </Text>
        <View style={styles.categories}>
          <FlatList
            horizontal
            initialNumToRender={4}
            data={this.state.categories}
            showsHorizontalScrollIndicator={false}
            renderItem={this.renderCategoryItem}
            keyExtractor={item => `${item.id}`}
          />
        </View>
        <Text style={styles.title}> {IMLocalized('Best Deals')} </Text>
        <View style={styles.deals}>
          <View style={styles.carousel}>
            <Carousel
              ref={c => {
                this.slider1Ref = c;
              }}
              data={this.state.deals}
              renderItem={this.renderDealItem}
              sliderWidth={viewportWidth}
              itemWidth={viewportWidth}
              // hasParallaxImages={true}
              inactiveSlideScale={1}
              inactiveSlideOpacity={1}
              firstItem={0}
              loop={false}
              // loopClonesPerSide={2}
              autoplay={false}
              autoplayDelay={500}
              autoplayInterval={3000}
              onSnapToItem={index => this.setState({activeSlide: index})}
            />
            <Pagination
              dotsLength={this.state.deals.length}
              activeDotIndex={activeSlide}
              containerStyle={styles.paginationContainer}
              dotColor="rgba(255, 255, 255, 0.92)"
              dotStyle={styles.paginationDot}
              inactiveDotColor="white"
              inactiveDotOpacity={0.4}
              inactiveDotScale={0.6}
              carouselRef={this.slider1Ref}
              tappableDots={!!this.slider1Ref}
            />
          </View>
        </View>
        <View style={styles.mostPopular}>
          <Text style={styles.title}> {IMLocalized('Most Popular')} </Text>
            <PopularProductsListView />
        </View>
      </ScrollView>
    );
  }
}

HomeScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }),
};

const mapStateToProps = state => ({
  user: state.auth.user,
  vendors: state.vendor.vendors,
  popularProducts: state.vendor.popularProducts
});

export default connect(mapStateToProps, {overrideCart, setVendors, setPopularProducts, setCartVendor})(HomeScreen);
