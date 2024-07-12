import type { AllowedComponentProps, AppContext, VNodeProps } from 'vue'

let appContextMap: Record<string, AppContext> = {}
const DEFAULT_APP_KEY = 'default'
const APPEND_TO_ELEMENT_ID = 'async-modal-root'
const MODAL_ELEMENT_CLASS_NAME = 'async-modal'

type AsyncModalHandlers<T = any> = {
  callback: (action: 'confirm' | 'cancel', payload?: T) => void;
  destroy: () => void;
  close: () => void;
};

// 注入的props
export type AsyncModalInjectedProps<T = any> = AsyncModalHandlers<T> & {
  destroyOnClose?: boolean; // 关闭时销毁
};

type ComponentProps<C extends Component> = C extends new (...args: any) => any
  ? Omit<
      InstanceType<C>['$props'],
      keyof VNodeProps | keyof AllowedComponentProps
    >
  : never

type ExtractOptions<T extends Record<string, any>> = Omit<
  T,
  keyof AsyncModalHandlers | 'visible' | 'onUpdate:visible'
>

type InferPayloadType<T extends {}> = T extends {
  readonly callback: (action: any, payload?: infer R) => void
}
  ? R
  : unknown

// 强制计算类型
type Simplify<T> = T extends any ? { [P in keyof T]: T[P] } : never

type RemoveReadonly<T> = { -readonly [P in keyof T]: T[P] }

type AsyncComp = {
  new (): ComponentPublicInstance
}

type Options<T extends Component = AsyncComp> = Simplify<
  RemoveReadonly<ExtractOptions<ComponentProps<T>>>
>

function useExpose<T = Record<string, any>>(apis: T) {
  const instance = getCurrentInstance();
  if (instance) Object.assign(instance.proxy as object, apis);
}

function useModalState(initOptions: Record<string, unknown>) {
  const state = reactive<{
    visible: boolean;
    [key: string]: any;
  }>({
    visible: false,
    ...initOptions,
  });

  const toggle = (visible: boolean) => {
    state.visible = visible;
  };

  const open = (options: Record<string, any>) => {
    Object.assign(state, options);
    toggle(true);
  };

  const close = () => toggle(false);

  useExpose({ open, close, toggle });

  return {
    open,
    close,
    state,
    toggle,
  };
}

function mountComponent(RootComponent: Component, appKey: string) {
  const app = createApp(RootComponent);

  const inheritContext = appContextMap[appKey];
  inheritContext && Object.assign(app._context, inheritContext);

  const root = document.createElement('div');
  const container = document.createElement('div');
  root.className = MODAL_ELEMENT_CLASS_NAME;
  root.appendChild(container);

  document.getElementById(APPEND_TO_ELEMENT_ID)!.appendChild(root);

  return {
    instance: app.mount(container),
    unmount() {
      app.unmount();
      document.getElementById(APPEND_TO_ELEMENT_ID)!.removeChild(root);
    },
  };
}

function initInstance(
  Comp: any,
  options: Record<string, unknown>,
  appKey: string
) {
  const Wrapper = {
    setup() {
      const { state, toggle } = useModalState(options);
      return () => {
        return h(Comp, {
          ...state,
          'onUpdate:visible': toggle,
        });
      };
    },
  };

  return mountComponent(Wrapper, appKey);
}

async function openModal<T extends Component = AsyncComp>(
  comp: () => Promise<{ default: T }>,
  params: Options<T> = {} as Options<T>,
  appKey = DEFAULT_APP_KEY,
): Promise<Simplify<InferPayloadType<ComponentProps<T>>>> {

  let instance: ComponentPublicInstance<{}, any> | null = null
  let destroy = () => {}
  let close = () => {}

  return new Promise((resolve, reject) => {
    const injectedProps: AsyncModalInjectedProps = {
      callback: (action: 'confirm' | 'cancel', payload) => {
        action === 'confirm' ? resolve(payload) : reject(payload)
      },
      destroy: () => destroy(),
      close: () => close(),
      destroyOnClose: true,
    }

    const _props = {
      ...injectedProps,
      ...params,
    };

    if (!instance) {
      const { instance: _instance, unmount } = initInstance(
        defineAsyncComponent(comp),
        _props,
        appKey
      );
      instance = _instance;
      destroy = () => {
        instance = null;
        unmount();
      };
      close = () => {
        if (_props.destroyOnClose) {
          return destroy()
        }
        if (instance) {
          instance.toggle(false);
        }
      };
      instance.open();
    } else {
      instance.open(Object.assign({}, _props));
    }
  })
}

export default {
  install() {
    const root = document.createElement('div')
    root.id = APPEND_TO_ELEMENT_ID
    document.body.appendChild(root)
  }
}

export {
  openModal
}

