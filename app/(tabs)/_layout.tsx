import { LinearGradient } from 'expo-linear-gradient';
import { Tabs } from 'expo-router';
import { Home, MessageSquare, User, Users } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../constants/theme';

const TabIcon = ({ focused, icon: Icon, label }: { focused: boolean, icon: any, label: string }) => {
  if (focused) {
    return (
      <LinearGradient
        colors={[COLORS.purple, COLORS.blue]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.activePill}
      >
        <Icon color={COLORS.textMain} size={25} />
        <Text style={styles.activeText}>{label}</Text>
      </LinearGradient>
    );
  }

  return (
<View style={styles.inactiveContainer}>
      <Icon color={COLORS.textSecondary} size={24} />
      <Text style={styles.inactiveText}>{label}</Text>
    </View>
  );
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.floatingTabBar,
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={Home} label="Home" />,
        }}
      />
      <Tabs.Screen
        name="teams"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={Users} label="Teams" />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={MessageSquare} label="CHAT" />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={User} label="PERFIL" />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  floatingTabBar: {
    position: 'absolute', 
    bottom: 15,          
    left: 20,            
    right: 20,           
    height: 55,          
    backgroundColor: 'rgba(17, 18, 33, 0.95)', 
    borderRadius: 80,    
    borderTopWidth: 0,   
    elevation: 10,
    shadowColor: COLORS.blue,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    paddingBottom: 0,
    paddingTop: 0,
    justifyContent:'center',
  },
activePill: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: 55, 
    minWidth: 65,
    paddingHorizontal: 15,
    borderRadius: 30,
    marginTop: 17,
  },
  activeText: {
    color: COLORS.textMain,
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: 2,
  },
  inactiveContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 55,
    marginTop: 10,
  },
  inactiveText: {
    color: COLORS.textSecondary,
    fontSize: 8.5,
    fontWeight: '600',
    marginTop: 2,
  }
});