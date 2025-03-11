import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import * as MediaLibrary from 'expo-media-library';
import { SafeAreaView, StyleSheet, FlatList } from 'react-native';
import { Image } from 'expo-image';

const INITIAL_FETCH_STATE = {
  fetching: true,
  pageCursor: undefined,
  hasNextPage: true,
  assets: [],
};
const PAGE_SIZE = 10;


export default function App() {
  const [fetchedState, setFetchedState] = useState(INITIAL_FETCH_STATE);
  const [permissions, requestPermission] = MediaLibrary.usePermissions();
  const isLoadingAssets = useRef(false);


  useEffect(() => {
    if(permissions && !permissions.granted) {
     requestPermission()
    }
    console.warn(permissions)
  }, [permissions])

  const loadMoreAssets = async () => {
    // if a fetch operation is still in progress or there are no more assets, return
    if (isLoadingAssets.current || !fetchedState.hasNextPage) {
      return;
    }
    // don't fetch while a request is in progress
    isLoadingAssets.current = true;
    try {
      const { assets, endCursor, hasNextPage } =
        await MediaLibrary.getAssetsAsync({
          first: PAGE_SIZE,
          after: fetchedState.pageCursor,
          mediaType: ['photo', 'video'],
          sortBy: 'creationTime',
        });
      setFetchedState(({ assets: prevAssets }) => ({
        fetching: false,
        pageCursor: endCursor,
        hasNextPage,
        assets: [...prevAssets, ...assets],
      }));
    } catch(e) {
      console.warn(e)
    } finally {
      isLoadingAssets.current = false;
    }
  }

  useEffect(() => {
    if(permissions && permissions.granted) {
      loadMoreAssets();
    }
  }, [permissions]);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={fetchedState.assets}
        renderItem={({ item: asset }) => (
          <Image style={styles.image} source={asset.uri} />
        )}
        keyExtractor={item => item.id}
        onEndReached={loadMoreAssets}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
    padding: 8,
  },
  image: {
    flex: 1,
    width: '100%',
    height: 100,
    backgroundColor: '#0553',
    
  },
});
