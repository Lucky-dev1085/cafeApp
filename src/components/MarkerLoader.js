import React, { Component, useState } from 'react'
import { ActivityIndicator, View, StyleSheet } from 'react-native'

export default class MarkerLoader extends Component {
  render() {
    if (this.props.enabled) return (
      <View style={[styleOf.container, { top: this.props.top }]}>
        <ActivityIndicator size="small" color="blue" />
      </View>
    );

    return null;
  }
}

const styleOf = StyleSheet.create({
  container: {
    width: '100%',
    height: 50,
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    backgroundColor: 'transparent',
  },
});