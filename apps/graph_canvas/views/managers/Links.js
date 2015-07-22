'use strict';

import React, // eslint-disable-line no-unused-vars
  { Component, PropTypes } from 'react';

import mixin from 'react-mixin';
import decorate from 'common-web-ui/lib/decorate';

import DragEventHelpers from '../../mixins/DragEventHelpers';

import Vector from '../../lib/Vector';

// import Link from '../../lib/Graph/Link';
// import GraphCanvasLink from '../elements/Link';
import GCPartialLinkElement from '../elements/PartialLink';

@decorate({
  propTypes: {},
  defaultProps: {},
  contextTypes: {
    graphCanvas: PropTypes.any
  }
})
@mixin.decorate(DragEventHelpers)
export default class GCLinksManager extends Component {

  get graphCanvas() {
    return this.context.graphCanvas;
  }

  // links = this.graphCanvas.props.initialLinks;

  shouldComponentUpdate() {
    return false;
  }

  render() {
    return null;
  }

  register(link) {
    this.graphCanvas.associateLink(link);
  }

  unregister(link) {
    this.graphCanvas.forgetLinkAssociation(link);
  }

  getSocketCenter(socketElement) {
    var element = socketElement,
        bounds = [],
        c = null,
        x = 0,
        y = 0;
    do {
      if (element.dataset && element.dataset.id) {
        c = this.graphCanvas.lookup(element.dataset.id);
        if (c && c.id && c.id.indexOf('group') === 0) { break; }
        if (c && c.state && c.state.bounds) { bounds.push(c.state.bounds); }
      }
      x += element.offsetLeft;
      y += element.offsetTop;
      if (c && c.id && c.id.indexOf('node') === 0) {
        try {
          // HACK: get ports element of socket.
          c = React.findDOMNode(c).childNodes[1].firstChild;
          // y -= Math.max(c.scrollTop,  (c.scrollHeight - c.offsetHeight - 15));
          y -= c.scrollTop;
        }
        catch (err) { console.error(err.stack || err); }
        break;
      }
      element = element.offsetParent;
    } while(element);
    bounds.forEach(b => {
      let p = b.position;
      x += p.x;
      y += p.y;
    });
    x += socketElement.clientWidth / 2;
    y += socketElement.clientHeight / 2;
    // HACK: position seems to be off, not sure why yet.
    x += 5;
    y += 3;
    return new Vector(x, y);
  }

  drawLinkStart(event, dragState, e) {
    event.stopPropagation();
    dragState.fromNode = this.graphCanvas.refs.viewport.delegatesTo(e.target, 'GraphCanvasNode');
    var dom = this.graphCanvas.refs.viewport.delegatesTo(e.target, 'GraphCanvasSocketIcon'),
        start;
    if (dom) {
      start = this.graphCanvas.getSocketCenter(dom);
    }
    else {
      dom = React.findDOMNode(this.graphCanvas.refs.world);
      start = this.graphCanvas.getEventCoords(event, dom);
    }
    dragState.link = new Link({
      data: {
        bounds: new Rectangle(start),
        fromNode: dragState.fromNode,
        fromSocket: this.graphCanvas.refs.viewport.delegatesTo(e.target, 'GraphCanvasSocket')
      },
      layer: 1,
      scale: 1
    });
  }

  drawLinkContinue(event, dragState, e) {
    event.stopPropagation();
    var dom = this.delegatesTo(e.target, 'GraphCanvasSocketIcon'),
        end;
    if (dom) {
      end = this.graphCanvas.getSocketCenter(dom);
    } else {
      dom = React.findDOMNode(this.graphCanvas.refs.world);
      end = this.graphCanvas.getEventCoords(event, dom);
    }
    dragState.link.data.bounds.max = end;
    this.activeLink = dragState.link;
  }

  drawLinkFinish(event, dragState, e) {
    event.stopPropagation();
    var isTargetNode = this.graphCanvas.refs.viewport.delegatesTo(e.target, 'GraphCanvasNode');
    dragState.link.data.toNode = isTargetNode;
    dragState.link.data.toSocket = this.graphCanvas.refs.viewport.delegatesTo(e.target, 'GraphCanvasSocket');
    if (dragState.link && isTargetNode && isTargetNode !== dragState.fromNode) {
      this.addLink(dragState.link);
    }
    this.activeLink = null;
  }

}
