<script lang="ts">
  import { Meta, Story } from "@storybook/addon-svelte-csf";
  import { Alert } from ".";
</script>

<Meta title="components/Alert" component={Alert} />

<Story name="Success">
  <div>
    <Alert variant="success" title="Autopilot Enabled">
      <svelte:fragment slot="body">
        <p>
          Vearn will periodically exchange VTHO for VET while keeping a balance
          of 15 VTHO in your account.
        </p>
      </svelte:fragment>
    </Alert>
  </div>
</Story>

<Story name="Info">
  <div>
    <Alert variant="info" title="Autopilot Enabled">
      <svelte:fragment slot="body">
        <p>
          Vearn will periodically exchange VTHO for VET while keeping a balance
          of 15 VTHO in your account.
        </p>
      </svelte:fragment>
    </Alert>
  </div>
</Story>

<Story name="Warning">
  <div>
    <Alert variant="warning" title="Autopilot Enabled">
      <svelte:fragment slot="body">
        <p>
          Vearn will periodically exchange VTHO for VET while keeping a balance
          of 15 VTHO in your account.
        </p>
      </svelte:fragment>
    </Alert>
  </div>
</Story>

<Story name="Closable">
  <div>
    <Alert variant="success" title="Autopilot Enabled" closable={true}>
      <svelte:fragment slot="body">
        <p>
          Vearn will periodically exchange VTHO for VET while keeping a balance
          of 15 VTHO in your account.
        </p>
      </svelte:fragment>
    </Alert>
  </div>
</Story>
