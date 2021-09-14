import * as React from 'react';
import { usePopper, Modifier } from 'react-popper';
import { withClickOutsideFC, WithClickOutsideFCProps } from '../../hoc/withClickOutsideFC';
import styled, { css, themed } from '../../utils/styled';
import { getFontStyle } from '../../textStyles';
import { distance } from '../../distance';
import {
  mapFlyoutPositionToPopperPlacement,
  calculateArrowStyleOverrides,
} from '../../utils/flyoutCompatibilityHelpers';
const { useState, useEffect } = React;
import { flyout } from '../../themes';
import { FlyoutProps } from './Flyout.types.part';
export { FlyoutProps } from './Flyout.types.part';

const FlyoutContainer = styled.div`
  position: relative;
  display: inline-block;
  width: fit-content;
`;

FlyoutContainer.displayName = 'FlyoutContainer';

const FlyoutTarget = styled.div``;
FlyoutTarget.displayName = 'FlyoutTarget';

const FlyoutBody = styled.div(
  themed(
    ({ theme }) => css`
      ${getFontStyle({ size: 'medium' })}
      z-index: 100;
      position: absolute;
      width: fit-conent;
      box-shadow: 0 2px 6px 0 rgba(75, 78, 82, 0.2);
      border: 1px solid ${theme.ui4};
      overflow: visible;
      &[data-popper-reference-hidden='true'] {
        visibility: hidden;
      }
    `,
  ),
);
FlyoutBody.displayName = 'FlyoutBody';

const FlyoutArrow = styled.div(
  themed(
    ({ theme }) => css`
      pointer-events: none;
      position: absolute;
      z-index: 101;
      width: ${theme.flyout.arrowSize}px;
      height: ${theme.flyout.arrowSize}px;

      :before {
        content: ' ';
        position: absolute;
        top: ${theme.flyout.arrowSize}px;
        left: 0;
        border-style: solid;
        border-width: ${theme.flyout.arrowSize / 2}px;
        border-color: ${theme.ui4} transparent transparent transparent;
      }

      :after {
        content: ' ';
        position: absolute;
        top: ${theme.flyout.arrowSize}px;
        left: 0;
        border-style: solid;
        border-width: ${theme.flyout.arrowSize / 2 - 1}px;
        margin-left: 1px;
        border-color: ${theme.flyout.background} transparent transparent transparent;
      }
    `,
  ),
);
FlyoutArrow.displayName = 'FlyoutArrow';

interface FlyoutContentProps {
  noGutter?: boolean;
}

const FlyoutContent = styled.div<FlyoutContentProps>(
  themed<FlyoutContentProps>(
    ({ theme, noGutter }) => css`
      overflow: auto;
      background: ${theme.flyout.background};
      color: ${theme.flyout.textColor};
      max-width: ${theme.flyout.maxWidth};
      max-height: ${theme.flyout.maxHeight};
      ${noGutter ? '' : `padding: ${distance.small} ${distance.medium};`}
    `,
  ),
);
FlyoutContent.displayName = 'FlyoutContent';

const FlyoutInt: React.FC<FlyoutProps & WithClickOutsideFCProps> = props => {
  const [controlled] = useState<boolean>(props.open !== undefined);
  const [visible, setVisible] = useState<boolean>(Boolean(props.open));
  const [referenceElement, setReferenceElement] = useState<HTMLDivElement | undefined>();
  const [popperElement, setPopperElement] = useState<HTMLDivElement | undefined>();
  const [arrowElement, setArrowElement] = useState<HTMLDivElement | undefined>();

  const popperModifiers: Array<Modifier<unknown>> = [
    { name: 'hide' },
    { name: 'flip', enabled: !props.position },
    { name: 'arrow', options: { element: arrowElement } },
    { name: 'offset', options: { offset: [0, props.offset || 4 + flyout.arrowSize / 2] } },
  ];

  if (!props.position) {
    popperModifiers.push({
      name: 'preventOverflow',
      options: {
        altAxis: true,
      },
    });
  }

  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: mapFlyoutPositionToPopperPlacement(props.position || props.defaultPosition),
    modifiers: popperModifiers,
  });

  useEffect(() => setVisible(Boolean(props.open)), [props.open]);
  useEffect(() => changeVisibility(false), [props.outsideClickEvent]);

  const onClick = () => changeVisibility(!visible);

  const changeVisibility = (nextVisibility: boolean) => {
    if (controlled || nextVisibility === visible) {
      return;
    }
    typeof props.onChange === 'function' && props.onChange({ open: nextVisibility });
    setVisible(nextVisibility);
  };

  return (
    <FlyoutContainer>
      <FlyoutTarget onClick={onClick} ref={setReferenceElement}>
        {props.children}
      </FlyoutTarget>
      {visible && props.content && (
        <FlyoutBody ref={setPopperElement} style={styles.popper} {...attributes.popper}>
          {/* Normally a styled component gets the theme from context. But some other component
          may pass a customized theme as a prop. See example at Tooltip component */}
          <FlyoutContent theme={props.theme}>{props.content}</FlyoutContent>
          <FlyoutArrow
            theme={props.theme}
            ref={setArrowElement}
            style={calculateArrowStyleOverrides(attributes.popper, styles.arrow)}
          />
        </FlyoutBody>
      )}
    </FlyoutContainer>
  );
};
FlyoutInt.displayName = 'FlyoutInt';

export const Flyout = withClickOutsideFC<FlyoutProps>(FlyoutInt);
Flyout.displayName = 'Flyout';