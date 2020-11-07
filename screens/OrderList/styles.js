import { StyleSheet } from 'react-native';
import DynamicAppStyles from '../../DynamicAppStyles';
import { Appearance } from "react-native-appearance";

const COLOR_SCHEME = Appearance.getColorScheme()

const styles = StyleSheet.create({
  flat: {
    flex: 1,
    backgroundColor:
      DynamicAppStyles.colorSet[COLOR_SCHEME].mainThemeBackgroundColor,
  },
  container: {
    marginBottom: 30,
    flex: 1,
    padding: 10,
  },
  photo: {
    width: '100%',
    height: 100,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  headerTitle: {
    position: 'absolute',
    top: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontWeight: 'bold',
    color: 'white',
    opacity: 0.8
  },
  rowContainer: {
    flexDirection: 'row',
  },
  count: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 1,
    borderWidth: 1,
    fontWeight: 'bold',
    paddingLeft: 7,
    paddingRight: 7,
    paddingTop: 2,
    paddingBottom: 2,
    textAlign: 'center',
    color: DynamicAppStyles.colorSet[COLOR_SCHEME].mainThemeForegroundColor,
    backgroundColor: DynamicAppStyles.colorSet[COLOR_SCHEME].mainThemeBackgroundColor,
    borderColor: DynamicAppStyles.colorSet[COLOR_SCHEME].mainThemeForegroundColor,
    borderWidth: 1,
    borderRadius: 3
  },
  price: {
    padding: 10,
    color: DynamicAppStyles.colorSet[COLOR_SCHEME].blueGrey,
    fontFamily: DynamicAppStyles.fontFamily.bold,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  title: {
    flex: 1,
    padding: 10,
    color: DynamicAppStyles.colorSet[COLOR_SCHEME].blueGrey,
    fontFamily: DynamicAppStyles.fontFamily.bold,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  actionContainer: {
    flexDirection: 'row',
    marginTop: 30,
  },
  total: {
    flex: 4,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: DynamicAppStyles.fontFamily.bold,
    fontWeight: 'bold',
    padding: 5,
    textAlign: 'center',
    color: DynamicAppStyles.colorSet[COLOR_SCHEME].mainTextColor,
    borderColor: DynamicAppStyles.colorSet.grey3,
  },
  actionButtonContainer: {
    flex: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 50,
    backgroundColor:
      DynamicAppStyles.colorSet[COLOR_SCHEME].mainThemeForegroundColor,
  },
  actionButtonText: {
    color: DynamicAppStyles.colorSet[COLOR_SCHEME].mainThemeBackgroundColor,
    fontSize: 12,
    fontFamily: DynamicAppStyles.fontFamily.bold,
  },
});

export default styles;
