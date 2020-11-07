import React, {useState} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import { useSelector } from 'react-redux';
import Modal from 'react-native-modal';
import FastImage from 'react-native-fast-image';
import styles from './styles';
import DynamicAppStyles from '../../../DynamicAppStyles';
import { FlatList } from 'react-native-gesture-handler';
import SingleItemDetailScreen from '../../SingleItemDetail/SingleItemDetailScreen';
import {Appearance} from 'react-native-appearance';
import { storeCartToDisk } from '../../../Core/cart/redux/reducers';

const COLOR_SCHEME = Appearance.getColorScheme();

function PopularProductsListView() {
    const popularProducts = useSelector((state) => state.vendor.popularProducts);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const onPress = (product) => {
        setSelectedProduct(product)
    }

    const renderProduct = (product) => {
        return (
            <TouchableOpacity onPress={() => onPress(product)}>
                <View style={styles.productItemContainer}>
                <FastImage
                    placeholderColor={DynamicAppStyles.colorSet[COLOR_SCHEME].grey9}
                    style={styles.productPhoto}
                    source={{uri: product.photo}}
                />
                <View style={styles.productInfo}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productPrice}>£{product.price}</Text>
                </View>
                </View>
            </TouchableOpacity>
        )
    }

    return (
        <View style={styles.container}>
            <FlatList
                renderItem={({item}) => renderProduct(item)}
                data={popularProducts}
                keyExtractor={item => `${item.id}`}
                initialNumToRender={2}
                showsHorizontalScrollIndicator={false}
            />
            <Modal
                style={styles.modalContainer}
                swipeDirection="down"
                onSwipeComplete={() => setSelectedProduct(null)}
                isVisible={selectedProduct !== null}>
                <SingleItemDetailScreen
                    foodItem={selectedProduct}
                    close={() => setSelectedProduct(null)}
                />
            </Modal>
        </View>
    );
}

export default PopularProductsListView;
