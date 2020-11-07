import React, { Component } from 'react';
import { FlatList, Text, View, TouchableOpacity } from 'react-native';
import Button from 'react-native-button';
import FastImage from 'react-native-fast-image';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import DynamicAppStyles from '../../DynamicAppStyles';
import styles from './styles';
import Hamburger from '../../components/Hamburger/Hamburger';
import {overrideCart} from '../../Core/cart/redux/actions';
import {updateOrders} from '../../Core/delivery/redux';
import {Appearance} from 'react-native-appearance'
import {firebase} from '../../Core/firebase/config';
import { IMLocalized } from '../../Core/localization/IMLocalization';
import { VENDOR_ORDERS } from '../../Configuration';

class OrderListScreen extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: IMLocalized('Orders'),
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

    this.COLOR_SCHEME = Appearance.getColorScheme()
    this.ref = 
      firebase
        .firestore()
        .collection(VENDOR_ORDERS)
        .where('authorID', '==', this.props.user.id)
        // .orderBy('createdAt', 'desc');

    this.state = {
      data: []
    };
  }

  componentDidMount() {
    this.unsubscribe = this.ref.onSnapshot(this.onCollectionUpdate, error => {
      console.log('OrderListScreen-error', error);
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  onReorderPress = item => {
    this.props.overrideCart(item.products);
    this.props.navigation.navigate('Cart', {appStyles: DynamicAppStyles});
  };

  onCollectionUpdate = querySnapshot => {
    const data = [];
    querySnapshot.forEach(doc => {
      const docData = doc.data();
      data.push({
        id: doc.id,
        ...docData
      });
    });

    this.props.updateOrders(data);
    this.setState({
      data,
      // loading: false,
    });
  };

  renderItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.container}
      onPress={() =>
        this.props.navigation.navigate('OrderTrackingScreen', {
          item,
          appStyles: DynamicAppStyles,
        })
      }>
      <View>
        {item != null &&
          item.products != null &&
          item.products[0] != null &&
          item.products[0].photo != null &&
          item.products[0].photo.length > 0 && (
            <FastImage
              placeholderColor={
                DynamicAppStyles.colorSet[this.COLOR_SCHEME].grey9
              }
              style={styles.photo}
              source={{ uri: item.products[0].photo }}
            />
          )}
        <View style={styles.overlay} />
            <Text style={styles.headerTitle}>{new Date(item.createdAt.toDate()).toDateString()} - {item.status}</Text>
      </View>
      {item.products.map(food => {
        return (
          <View style={styles.rowContainer} key={food.id}>
            <Text style={styles.count}>{food.quantity}</Text>
            <Text style={styles.title}>{food.name}</Text>
            <Text style={styles.price}>£{food.price}</Text>
          </View>
        );
      })}
      <View style={styles.actionContainer}>
        <Text style={styles.total}>
          Total: £
          {(item.products.reduce((prev, next) => prev + next.price * next.quantity, 0)).toFixed(2)}
        </Text>
        <Button
          containerStyle={styles.actionButtonContainer}
          style={styles.actionButtonText}
          onPress={() => this.onReorderPress(item)}
        >
          {IMLocalized("REORDER")}
        </Button>
      </View>
    </TouchableOpacity>
  );

  render() {
    return (
      <FlatList
        style={styles.flat}
        data={this.state.data}
        renderItem={this.renderItem}
        keyExtractor={item => `${item.id}`}
        initialNumToRender={5}
      />
    );
  }
}

OrderListScreen.propTypes = {
  user: PropTypes.shape(),
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  })
};

// export default CartScreen;
const mapStateToProps = state => ({
  user: state.auth.user,
  orderList: state.orders.orderList,
});

export default connect(mapStateToProps, {overrideCart, updateOrders})(
  OrderListScreen,
);
