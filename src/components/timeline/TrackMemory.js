/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// @flow

import * as React from 'react';
import explicitConnect from '../../utils/connect';
import {
  getCommittedRange,
  getCounterSelectors,
} from '../../selectors/profile';
import { TimelineMarkersMemory } from './Markers';
import { updatePreviewSelection } from '../../actions/profile-view';
import { TrackMemoryGraph } from './TrackMemoryGraph';

import type { CounterIndex, ThreadIndex } from '../../types/profile';
import type { Milliseconds } from '../../types/units';
import type { ConnectedProps } from '../../utils/connect';

import './TrackMemory.css';

export const GRAPH_HEIGHT = 25;
export const MARKERS_HEIGHT = 15;
export const TRACK_MEMORY_HEIGHT = GRAPH_HEIGHT + MARKERS_HEIGHT;
export const LINE_WIDTH = 2;

type OwnProps = {|
  +counterIndex: CounterIndex,
|};

type StateProps = {|
  +threadIndex: ThreadIndex,
  +rangeStart: Milliseconds,
  +rangeEnd: Milliseconds,
|};

type DispatchProps = {|
  updatePreviewSelection: typeof updatePreviewSelection,
|};

type Props = ConnectedProps<OwnProps, StateProps, DispatchProps>;

type State = {||};

export class TrackMemoryImpl extends React.PureComponent<Props, State> {
  _onMarkerSelect = (
    threadIndex: ThreadIndex,
    start: Milliseconds,
    end: Milliseconds
  ) => {
    const { rangeStart, rangeEnd, updatePreviewSelection } = this.props;
    updatePreviewSelection({
      hasSelection: true,
      isModifying: false,
      selectionStart: Math.max(rangeStart, start),
      selectionEnd: Math.min(rangeEnd, end),
    });
  };

  render() {
    const { counterIndex, rangeStart, rangeEnd, threadIndex } = this.props;
    return (
      <div
        className="timelineTrackMemory"
        style={{
          height: GRAPH_HEIGHT + MARKERS_HEIGHT,
          '--graph-height': `${GRAPH_HEIGHT}px`,
          '--markers-height': `${MARKERS_HEIGHT}px`,
        }}
      >
        <TimelineMarkersMemory
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          threadIndex={threadIndex}
          onSelect={this._onMarkerSelect}
        />
        <TrackMemoryGraph
          counterIndex={counterIndex}
          lineWidth={LINE_WIDTH}
          graphHeight={GRAPH_HEIGHT}
        />
      </div>
    );
  }
}

export const TrackMemory = explicitConnect<OwnProps, StateProps, DispatchProps>(
  {
    mapStateToProps: (state, ownProps) => {
      const { counterIndex } = ownProps;
      const counterSelectors = getCounterSelectors(counterIndex);
      const counter = counterSelectors.getCommittedRangeFilteredCounter(state);
      const { start, end } = getCommittedRange(state);
      return {
        threadIndex: counter.mainThreadIndex,
        rangeStart: start,
        rangeEnd: end,
      };
    },
    mapDispatchToProps: { updatePreviewSelection },
    component: TrackMemoryImpl,
  }
);
