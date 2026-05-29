import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../constants/theme';

export default function ComingSoonScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>KORU</Text>
      <Text style={styles.subtitle}>Próximamente...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.blue,
    letterSpacing: 2,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.purple,
    fontWeight: '600',
  }
});