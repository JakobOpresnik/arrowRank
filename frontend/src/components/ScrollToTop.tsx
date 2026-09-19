import { ActionIcon, Affix, Transition } from '@mantine/core';
import { useWindowScroll } from '@mantine/hooks';
import { IconArrowUp } from '@tabler/icons-react';

const ScrollToTop = () => {
  const [scroll, scrollTo] = useWindowScroll();

  return (
    <Affix position={{ bottom: 24, right: 24 }}>
      <Transition transition='slide-up' mounted={scroll.y > 300}>
        {(transitionStyles) => (
          <ActionIcon
            variant='filled'
            size={48}
            radius='xl'
            style={{ ...transitionStyles, boxShadow: 'var(--mantine-shadow-md)' }}
            onClick={() => scrollTo({ y: 0 })}
          >
            <IconArrowUp size={24} />
          </ActionIcon>
        )}
      </Transition>
    </Affix>
  );
};

export default ScrollToTop;
