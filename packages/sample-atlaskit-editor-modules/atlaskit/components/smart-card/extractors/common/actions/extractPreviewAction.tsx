import { JsonLd } from 'json-ld-types';

import {
  BlockCardResolvedViewProps,
  PreviewAction,
} from '../../../../media-ui';
import { InvokeHandler } from '../../../model/invoke-handler';
import { InvokeClientOpts } from '../../../model/invoke-opts';
import {
  uiRenderFailedEvent,
  uiRenderSuccessEvent,
} from '../../../utils/analytics';
import { AnalyticsHandler } from '../../../utils/types';
import { CardInnerAppearance } from '../../../view/Card/types';
import { extractProvider } from '../context';
import { extractDownloadUrl } from '../detail';
import { extractPreview } from '../preview';

const getMetadataFromJsonLd = (jsonLd: JsonLd.Data.BaseData) => {
  const download = extractDownloadUrl(jsonLd as JsonLd.Data.Document);
  const provider = extractProvider(jsonLd);
  const preview = extractPreview(jsonLd);
  return {
    download,
    providerName: provider && provider.text,
    src: preview && preview.src,
  };
};

const getMetadataFromResolvedProps = (props: BlockCardResolvedViewProps) => ({
  /* It's fine for content to be undefined, but src is still needed for the link out, even if it's not the source for the iframing */
  link: props.link,
  title: props.title,
  details: props.details,
  icon: props.icon,
  url: props.link,
  byline: props.byline,
});

const getInvokeOpts = (
  key: string,
  action: string,
  source?: CardInnerAppearance,
): InvokeClientOpts => ({
  type: 'client' as const,
  key,
  // NB: the preview action is invoked from a block card -
  // the actions on the preview state are invoked from the
  // preview card. Hence, we have a `source` for distinguishing
  // between the two.
  source: source || 'preview',
  action: {
    type: action,
    promise: () => Promise.resolve(),
  },
});

export const extractPreviewAction = (
  definitionId = 'empty-object-provider',
  viewProps: BlockCardResolvedViewProps,
  jsonLd: JsonLd.Data.BaseData,
  handleInvoke: InvokeHandler,
  handleAnalytics: AnalyticsHandler,
  testId?: string,
) => {
  // Extract metadata from view props & raw JSON-LD.
  const metadataFromJsonLd = getMetadataFromJsonLd(jsonLd);
  const metadataFromViewProps = getMetadataFromResolvedProps(viewProps);
  const metadata = {
    ...metadataFromJsonLd,
    ...metadataFromViewProps,
  };
  // Extract preview action only if we have an iframe src.
  if (metadataFromJsonLd.src) {
    // Build action using instrumentation hooks.
    const key = definitionId;
    const previewAction = PreviewAction({
      ...metadata,
      testId,
      onOpen: () => {
        handleAnalytics(uiRenderSuccessEvent('preview', key));
      },
      onOpenFailed: (error, errorInfo) => {
        handleAnalytics(uiRenderFailedEvent('preview', error, errorInfo));
      },
      onDownloadActionClick: () => {
        handleInvoke(getInvokeOpts(key, 'DownloadAction'));
      },
      onViewActionClick: () => {
        handleInvoke(getInvokeOpts(key, 'ViewAction'));
      },
    });
    // Setup props to go through proper Redux 'invocation' flow
    // for analytics, further state management if required in future.
    const previewActionProps = getInvokeOpts(key, 'PreviewAction', 'block');
    // - Promise invoked by the action invocation handler; open preview.
    previewActionProps.action.promise = previewAction.promise;
    // - Promise invoked on click of `Preview` on block card; trigger above promise.
    previewAction.promise = () => handleInvoke(previewActionProps);
    return previewAction;
  }
};
